from flask_cors import CORS
from core import execute_omniccg
import subprocess
from flask import Flask, Response, request, jsonify, url_for, session, redirect
from authlib.integrations.flask_client import OAuth
from flask_github import GitHub
from get_code_snippets import _ensure_repo, _checkout, _safe_repo_path, _slice_lines, _read_text_with_fallback, _clean_git_locks
from pathlib import Path
from control import git_repos_to_control
import os

app = Flask(__name__)
frontend_origin = os.getenv('FRONTEND_URL', 'http://localhost:8080')
CORS(
    app,
    resources={r"/*": {"origins": frontend_origin}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
)
app.secret_key = os.getenv('SECRET_KEY')

oauth = OAuth(app)

github = oauth.register(
    name='github',
    client_id=os.getenv('GITHUB_CLIENT_ID'),
    client_secret=os.getenv('GITHUB_CLIENT_SECRET'),
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'read:user repo'},
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.route('/login/github', methods=['OPTIONS'])
def login_options():
    return '', 204

@app.get("/login/github")
def login():
    redirect_uri = url_for(
        'authorized',
        _external=True
    )

    return github.authorize_redirect(
        redirect_uri
    )

@app.get("/login/github/authorized")
def authorized():
    token = github.authorize_access_token()

    user = github.get(
        'user',
        token=token
    ).json()

    print(f"User {user['login']} authenticated successfully.")

    session['github_token'] = token

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:8080')
    return redirect(f"{frontend_url}/myrepos")

@app.get('/logout')
def logout():
    session.pop('github_token', None)
    session.clear()
    return jsonify({
        'message': 'Logged out successfully.'
    }), 200

@app.route('/api/repos', methods=['OPTIONS'])
def repos_options():
    return '', 204

@app.get('/api/repos')
def repos():
    token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()

    if not token:
        token = session.get('github_token')

    if not token:
        return jsonify({
            'error': 'Missing GitHub access token. Log in via /login/github first or provide a Bearer token.'
        }), 401

    if isinstance(token, dict):
        token = token.get('access_token') or token.get('token')

    resp = github.get(
        'user/repos',
        token={
            'access_token': token,
            'token_type': 'bearer'
        }
    )

    return jsonify(resp.json())

@app.post("/detect_clones")
def detect_clones():
    general_settings = request.get_json(silent=True)
    git_repository = general_settings.get("git_repository")
    git_repos_to_control.append(git_repository)
    xml_obj, _, _  = execute_omniccg(general_settings) 
    git_repos_to_control.remove(git_repository)
    return Response(xml_obj, status=200, mimetype="application/xml")


@app.post("/stop_detect_clones")
def stop_detect_clones():
    git_url = request.get_json(silent=True).get("gir_url")
    git_repos_to_control.remove(git_url)
    return jsonify({
        "message": f"Stop genealogy extraction from the repository: {git_url}",
    }), 200


@app.post("/get_code_snippets")
def snippets():
    payload = request.get_json(silent=True) or {}
    git_url = payload.get("git_url", "")
    commit = payload.get("commit", "")
    sources = payload.get("sources") or payload.get("items") or []

    git_repos_to_control.append(git_url)

    if not git_url or not commit or not isinstance(sources, list):
        return jsonify({
            "error": "Missing or invalid fields. Required: git_url (str), commit (str), sources (list)."
        }), 400

    try:
        repo_dir = _ensure_repo(git_url)
        _checkout(repo_dir, commit)
    except subprocess.CalledProcessError as e:
        error_msg = f"Git operation failed: {e}"
        if "index.lock" in str(e) or "another git process" in str(e).lower():
            error_msg += "\nGit lock file issue - attempting to clean and retry..."
            try:
                # Try to clean locks and retry
                _clean_git_locks(repo_dir)
                _checkout(repo_dir, commit)
            except Exception as retry_error:
                return jsonify({"error": f"Git retry failed: {retry_error}"}), 500
        else:
            return jsonify({"error": error_msg}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    results = []
    for src in sources:
        fpath = src.get("file") or src.get("path")
        startline = src.get("startline") or src.get("start") or src.get("ls")
        endline = src.get("endline") or src.get("end") or src.get("le")

        repo_name = git_url.split('/')[-1]
        item = {
            "file": fpath.split(f'{repo_name}/repo/')[-1],
            "startline": startline,
            "endline": endline,
        }

        if not fpath or startline is None or endline is None:
            item["error"] = "Invalid item. Required keys: file, startline, endline."
            results.append(item)
            continue

        try:
            abs_path = _safe_repo_path(repo_dir, fpath)
            text = _read_text_with_fallback(str(abs_path))
            snippet = _slice_lines(text, int(startline), int(endline))
            item["content"] = snippet
        except Exception as e:
            item["error"] = f"{type(e).__name__}: {e}"

        results.append(item)

    return jsonify({
        "repo_dir": repo_dir,
        "commit": commit,
        "count": len(results),
        "snippets": results
    }), 200


@app.post("/get_metrics")
def get_metrics():
    payload = request.get_json(silent=True) or {}
    git_url = payload.get("git_url", "")
    project = git_url.split('/')[-1]
    base_dir = Path.cwd() / "cloned_repositories" / project
    metrics_path = (base_dir / "metrics.xml").resolve()
    xml_result = open(metrics_path, 'r').read()
    
    return Response(xml_result, status=200, mimetype="application/xml")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
