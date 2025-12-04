import { useEffect } from "react";
import { motion } from "framer-motion";

/**
 * パーティクル爆発エフェクトコンポーネント
 * キューアイテムが削除された時のビジュアルエフェクト
 */
export default function ParticleExplosion({ position, width, height, onComplete }) {
    const particleCount = 100;
    const particles = Array.from({ length: particleCount }, (_, i) => {
        // パーティクルの初期位置を要素全体にわたってランダムに配置
        const startX = (Math.random() - 0.5) * width;
        const startY = (Math.random() - 0.5) * height;
        
        // 各パーティクルがランダムな方向に飛び散る
        const angle = Math.random() * Math.PI * 2;
        const velocity = 80 + Math.random() * 70;
        const grayValue = Math.floor(180 + Math.random() * 75); // 180-255の範囲で白と灰色の間
        return {
            id: i,
            startX: startX,
            startY: startY,
            x: startX + Math.cos(angle) * velocity,
            y: startY + Math.sin(angle) * velocity,
            size: 2 + Math.random() * 3,
            rotation: Math.random() * 360,
            color: `rgb(${grayValue}, ${grayValue}, ${grayValue})`,
        };
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    initial={{
                        x: particle.startX,
                        y: particle.startY,
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                    }}
                    animate={{
                        x: particle.x,
                        y: particle.y,
                        opacity: 0,
                        scale: 0,
                        rotate: particle.rotation,
                    }}
                    transition={{
                        duration: 1.0,
                        ease: 'easeOut',
                    }}
                    style={{
                        position: 'absolute',
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        borderRadius: '50%',
                    }}
                />
            ))}
        </div>
    );
}

