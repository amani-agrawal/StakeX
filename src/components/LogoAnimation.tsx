import React, { useState, useEffect } from 'react';
import './LogoAnimation.css';

interface LogoAnimationProps {
  onComplete: () => void;
}

const LogoAnimation: React.FC<LogoAnimationProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase(1); // Logo appears
    }, 300);

    const timer2 = setTimeout(() => {
      setAnimationPhase(2); // Logo scales up
    }, 800);

    const timer3 = setTimeout(() => {
      setAnimationPhase(3); // Logo fades out
    }, 2000);

    const timer4 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="logo-animation-overlay">
      <div className={`logo-container ${animationPhase >= 1 ? 'visible' : ''}`}>
        <div className={`logo ${animationPhase >= 2 ? 'scaled' : ''} ${animationPhase >= 3 ? 'fading' : ''}`}>
          <div className="logo-text">StakeX</div>
          <div className="logo-subtitle">Marketplace</div>
        </div>
      </div>
    </div>
  );
};

export default LogoAnimation;
