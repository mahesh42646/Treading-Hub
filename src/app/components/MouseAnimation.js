'use client';

import { useEffect, useState, useRef } from 'react';

const MouseAnimation = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mouseDirection, setMouseDirection] = useState({ x: 0, y: 0 });
  const [wickHeight, setWickHeight] = useState(20);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let timeoutId;

    const handleMouseMove = (e) => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      // Calculate mouse direction
      const deltaX = currentX - lastMousePos.current.x;
      const deltaY = currentY - lastMousePos.current.y;
      
      setMouseDirection({ x: deltaX, y: deltaY });
      setMousePosition({ x: currentX, y: currentY });
      setIsVisible(true);
      
      // Update wick height based on mouse movement
      if (Math.abs(deltaY) > 1) {
        setWickHeight(prev => {
          const newHeight = prev + (deltaY > 0 ? 1 : -1);
          return Math.max(5, Math.min(35, newHeight));
        });
      }
      
      lastMousePos.current = { x: currentX, y: currentY };
      
      // Clear existing timeout
      clearTimeout(timeoutId);
      
      // Hide cursor after 3 seconds of no movement
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
          e.target.closest('a') || e.target.closest('button') ||
          e.target.role === 'button' || e.target.tabIndex !== undefined) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      clearTimeout(timeoutId);
    };
  }, []);

  const isBullish = mouseDirection.y < 0;
  const isBearish = mouseDirection.y > 0;

  return (
    <>
      <style jsx>{`
        .trading-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 30px;
          height: 40px;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.1s ease-out, width 0.2s ease, height 0.2s ease;
        }

        .trading-cursor.visible {
          opacity: 1;
        }

        .trading-cursor.hovering {
          width: 35px;
          height: 45px;
        }

        .chart-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .candlestick {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .candlestick.left {
          width: 3px;
          height: 30px;
        }

        .candlestick.center {
          width: 3px;
          height: 30px;
        }

        .candlestick.right {
          width: 3px;
          height: 30px;
        }

        .wick {
          width: 1px;
          background: rgba(156, 163, 175, 0.6);
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          transition: height 0.2s ease;
        }

        .body {
          width: 100%;
          border-radius: 1px;
          position: absolute;
          left: 0;
        }

        .body.green {
          background: rgba(16, 185, 129, 0.7);
          border: 1px solid rgba(16, 185, 129, 0.9);
        }

        .body.red {
          background: rgba(239, 68, 68, 0.7);
          border: 1px solid rgba(239, 68, 68, 0.9);
        }

        .body.center {
          background: rgba(59, 246, 72, 0.7);
          border: 1px solid rgba(156, 237, 181, 0.5);
          height: 15px;
          top: 7.5px;
        }

        .body.center.bullish {
          background: rgba(16, 185, 129, 0.7);
          border: 1px solid rgba(16, 185, 129, 0.9);
        }

        .body.center.bearish {
          background: rgba(239, 68, 68, 0.7);
          border: 1px solid rgba(239, 68, 68, 0.9);
        }

        /* Hide default cursor on interactive elements */
        a, button, input, textarea, select, [role="button"], [tabindex] {
          cursor: none !important;
        }

        /* Show default cursor on mobile/touch devices */
        @media (hover: none) and (pointer: coarse) {
          .trading-cursor {
            display: none;
          }
          
          a, button, input, textarea, select, [role="button"], [tabindex] {
            cursor: auto !important;
          }
        }
      `}</style>
      
      <div 
        className={`trading-cursor ${isVisible ? 'visible' : ''} ${isHovering ? 'hovering' : ''}`}
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}
      >
        <div className="chart-container">
          {/* Left candlestick - Fixed red with growing wick from top */}
          <div className="candlestick left">
            <div 
              className="wick"
              style={{
                height: `${wickHeight}px`,
                top: `${15 - wickHeight}px`
              }}
            />
            <div className="body red" style={{ height: '6px', top: '12px' }} />
          </div>

          {/* Center candlestick - Fixed size, changing color */}
          <div className="candlestick center">
            <div className={`body center ${isBullish ? 'bullish' : isBearish ? 'bearish' : ''}`} />
          </div>

          {/* Right candlestick - Fixed green with growing wick from bottom */}
          <div className="candlestick right">
            <div 
              className="wick"
              style={{
                height: `${wickHeight}px`,
                top: `${15}px`
              }}
            />
            <div className="body green" style={{ height: '6px', top: '12px' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MouseAnimation;
