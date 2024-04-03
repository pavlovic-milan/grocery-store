type BaseProps = {
  message: string;
  details: BaseProps[];
};

export default class ErrorData {
  constructor(
    readonly message: string,
    private details: ErrorData[] = [],
    private additionalData: Record<
      string,
      string | boolean | object | number
    > = {}
  ) {}

  public serialize(): BaseProps {
    return {
      message: this.message,
      details: this.details.map((d) => d.serialize()),
      ...this.additionalData
    };
  }
}
