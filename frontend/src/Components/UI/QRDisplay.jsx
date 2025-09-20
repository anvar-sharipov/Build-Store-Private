import { QRCode } from "react-qrcode-logo";

const QRDisplay = ({code, myClass, mySize}) => {
  return (
    <div>
      <QRCode value={code} size={mySize} />
    </div>
  );
}

export default QRDisplay