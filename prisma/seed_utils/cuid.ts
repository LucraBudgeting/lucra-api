export function generateCUID(): string {
  const base36 = (num: number) => num.toString(36);
  const pad = (size: number, str: string) => {
    while (str.length < size) str = "0" + str;
    return str;
  };
  const timestamp = new Date().getTime().toString(36);
  const counter = (() => {
    let count = 0;
    return () => {
      count = count < 1679615 ? count + 1 : 0;
      return pad(4, base36(count));
    };
  })();
  const randomBlock = () => pad(4, base36(Math.floor(Math.random() * 1679616)));
  const fingerprint = () => pad(4, base36(Math.floor(Math.random() * 1679616)));

  return `c${timestamp}${counter()}${randomBlock()}${fingerprint()}`;
}
