import React from "react";
import { LoginPanelContent } from "";

export const LoginWithPhone: React.FC<{}> = ({ buttons: userButtons, renderQRCode }) => {
  const [showQRCode, setShowQRCode] = useState(false);

  function renderQRCodePage(): React.ReactNode {
    return (
      <div className="login-with-wechat">
        <div className="login-width-limiter">
          <div className="login-qrcode">{renderQRCode()}</div>
        </div>
      </div>
    );
  }

  return (
    <LoginPanelContent>{showQRCode ? renderQRCodePage() : renderLoginPage()}</LoginPanelContent>
  );
};
