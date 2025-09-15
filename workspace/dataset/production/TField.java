package com.facebook.thrift.protocol;

/**
 * Helper class that encapsulates field metadata.
 *
 * @author Mark Slee <mcslee@facebook.com>
 */
public class TField {
  public TField() {}

  public TField(String n, byte t, short i) {
    name = n;
    type = t;
    id = i;
  }

  public String name = "";
  public byte   type = TType.STOP;
  public short  id   = 0;
}
