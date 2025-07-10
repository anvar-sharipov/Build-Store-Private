import { QRCode } from "react-qrcode-logo";

const QRDisplay = ({code, myClass, mySize}) => {
  return (
    <div className={myClass} >
      <QRCode value={code} size={mySize} />
    </div>
  );
}

export default QRDisplay