import React, { useRef } from "react";

export const BigClassPage: React.FC = () => {
  const loadingPageRef = useRef(false);

  return (
    <div className="big-class-realtime-container">
      {loadingPageRef.current && <div>LoadingPage</div>}
      <div className="big-class-realtime-box">BigClassPage</div>
    </div>
  );
};

export default BigClassPage;
