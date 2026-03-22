"use client";

import { useEffect, useRef, useState } from "react";

type HeartMotion = {
  flowOffset: number;
  glow: number;
  rotate: number;
  scale: number;
  shimmer: number;
  translateY: number;
};

const BODY_PATH =
  "M268 580 C236 570 209 544 186 505 C161 464 144 417 137 368 C129 308 135 252 148 205 C161 158 183 123 212 105 C232 93 252 92 266 101 C281 112 292 132 299 159 C310 138 325 121 344 112 C374 99 406 107 431 131 C457 156 470 194 469 238 C468 287 451 338 426 388 C402 437 372 484 344 524 C321 556 297 587 268 580 Z";
const LEFT_AURICLE_PATH =
  "M206 188 C182 180 162 166 149 145 C137 124 138 100 152 82 C167 62 191 60 210 74 C227 87 237 107 237 130 C237 154 227 173 206 188 Z";
const RIGHT_ATRIUM_PATH =
  "M372 207 C398 186 425 179 446 194 C467 209 476 235 469 260 C461 289 439 307 410 313 C405 273 392 237 372 207 Z";

const initialMotion: HeartMotion = {
  flowOffset: 0,
  glow: 0.38,
  rotate: -7,
  scale: 1,
  shimmer: 0.42,
  translateY: 0,
};

export function AnimatedHeart() {
  const frameRef = useRef<number>(0);
  const lastStepRef = useRef(0);
  const [motion, setMotion] = useState(initialMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    const step = (now: number) => {
      if (now - lastStepRef.current >= 33) {
        const time = now / 1000;
        const primaryBeat = Math.max(0, Math.sin(time * 2.45)) ** 8;
        const secondaryBeat = Math.max(0, Math.sin(time * 2.45 - 0.68)) ** 12 * 0.52;
        const heartbeat = primaryBeat + secondaryBeat;

        setMotion({
          flowOffset: (time * 56) % 180,
          glow: 0.28 + heartbeat * 0.62,
          rotate: -8 + Math.sin(time * 0.38) * 3.8,
          scale: 0.985 + heartbeat * 0.055,
          shimmer: 0.24 + (Math.sin(time * 1.05) * 0.5 + 0.5) * 0.45,
          translateY: Math.sin(time * 0.82) * 10 - heartbeat * 8,
        });

        lastStepRef.current = now;
      }

      frameRef.current = window.requestAnimationFrame(step);
    };

    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
      <svg
        viewBox="0 0 560 640"
        className="h-full w-full overflow-visible"
        style={{
          filter: `drop-shadow(0 24px 56px rgba(122, 18, 36, ${0.08 + motion.glow * 0.18}))`,
        }}
      >
        <defs>
          <radialGradient id="heart-glow" cx="52%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ff92a6" stopOpacity="0.38" />
            <stop offset="45%" stopColor="#f67c93" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#7a1327" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="body-fill" x1="168" y1="88" x2="403" y2="586">
            <stop offset="0%" stopColor="#fff9fb" stopOpacity="0.64" />
            <stop offset="20%" stopColor="#ffe0e7" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#f292a2" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#861b31" stopOpacity="0.32" />
          </linearGradient>
          <radialGradient id="left-fill" cx="36%" cy="30%" r="82%">
            <stop offset="0%" stopColor="#fff6f8" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#ffc7d2" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#9a2841" stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id="right-fill" cx="55%" cy="22%" r="90%">
            <stop offset="0%" stopColor="#fff1f5" stopOpacity="0.42" />
            <stop offset="50%" stopColor="#ffafbf" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#9f233f" stopOpacity="0.08" />
          </radialGradient>
          <linearGradient id="vessel-fill" x1="183" y1="28" x2="430" y2="240">
            <stop offset="0%" stopColor="#fff9fb" stopOpacity="0.68" />
            <stop offset="50%" stopColor="#ffd2dc" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#8d2038" stopOpacity="0.36" />
          </linearGradient>
          <linearGradient id="artery-flow" x1="195" y1="170" x2="360" y2="520">
            <stop offset="0%" stopColor="#ffecef" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d24f66" stopOpacity="0.44" />
          </linearGradient>
          <linearGradient id="glass-highlight" x1="188" y1="120" x2="338" y2="515">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#fff0f5" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="big-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <clipPath id="heart-volume">
            <path d={BODY_PATH} />
            <path d={LEFT_AURICLE_PATH} />
            <path d={RIGHT_ATRIUM_PATH} />
          </clipPath>
        </defs>

        <g
          transform={`translate(0 ${motion.translateY}) translate(280 318) rotate(${motion.rotate}) scale(${motion.scale}) translate(-280 -318)`}
        >
          <ellipse
            cx="286"
            cy="324"
            rx="146"
            ry="214"
            fill="url(#heart-glow)"
            filter="url(#big-blur)"
            opacity={motion.glow}
          />

          <path
            d={LEFT_AURICLE_PATH}
            fill="url(#left-fill)"
            stroke="rgba(119, 19, 37, 0.28)"
            strokeWidth="2.2"
          />
          <path
            d={RIGHT_ATRIUM_PATH}
            fill="url(#right-fill)"
            stroke="rgba(119, 19, 37, 0.22)"
            strokeWidth="2.2"
          />
          <path
            d={BODY_PATH}
            fill="url(#body-fill)"
            stroke="rgba(93, 11, 24, 0.48)"
            strokeWidth="3"
            filter="url(#soft-glow)"
          />

          <g fill="none" stroke="url(#vessel-fill)" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M302 178 C300 140 304 108 315 75 C323 51 339 37 356 39 C373 41 385 57 386 79 C388 104 375 130 352 150"
              strokeWidth="14"
            />
            <path
              d="M327 77 C324 43 329 17 344 -9"
              strokeWidth="8"
            />
            <path
              d="M351 69 C362 41 380 17 401 -3"
              strokeWidth="8"
            />
            <path
              d="M373 82 C394 68 416 62 440 67"
              strokeWidth="8"
            />
            <path
              d="M279 183 C246 150 214 138 186 142 C161 145 141 161 132 184 C123 208 128 232 143 249 C160 268 188 274 222 265"
              strokeWidth="13"
            />
            <path
              d="M228 157 C213 131 196 112 178 103 C161 95 145 99 133 112"
              strokeWidth="6"
            />
            <path
              d="M309 186 C336 179 361 178 383 188 C403 196 419 212 430 233"
              strokeWidth="10"
            />
            <path
              d="M411 184 C429 164 441 141 445 114 C448 91 443 73 431 61"
              strokeWidth="9"
            />
            <path
              d="M196 114 C179 91 165 74 152 65 C141 58 128 58 118 65"
              strokeWidth="5.5"
            />
          </g>

          <g fill="none" stroke="rgba(103, 11, 28, 0.44)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M298 185 C293 245 294 312 301 386 C307 448 311 512 315 565" strokeWidth="3.2" />
            <path d="M247 225 C224 279 214 334 217 395 C220 450 228 494 242 535" strokeWidth="2.9" />
            <path d="M340 251 C352 290 358 333 360 379 C362 432 359 474 353 515" strokeWidth="2.8" />
            <path d="M219 248 C197 275 184 307 178 344" strokeWidth="2.3" />
            <path d="M353 235 C379 253 397 279 407 315" strokeWidth="2.3" />
            <path d="M279 214 C252 198 227 194 201 201" strokeWidth="2.2" />
            <path d="M329 215 C352 221 372 233 388 249" strokeWidth="2.2" />
          </g>

          <g
            fill="none"
            stroke="url(#artery-flow)"
            strokeDasharray="11 14"
            strokeDashoffset={-motion.flowOffset}
            strokeLinecap="round"
          >
            <path d="M251 208 C225 249 211 298 206 354 C201 413 208 468 225 522" strokeWidth="3.1" />
            <path d="M320 214 C341 248 355 289 361 336 C367 385 364 436 356 484" strokeWidth="2.9" />
            <path d="M201 283 C182 309 170 340 165 379" strokeWidth="2.5" />
            <path d="M365 279 C384 304 396 336 402 374" strokeWidth="2.5" />
            <path d="M287 329 C280 371 280 414 286 457" strokeWidth="2.3" />
          </g>

          <g clipPath="url(#heart-volume)">
            <ellipse
              cx="230"
              cy="250"
              rx="82"
              ry="190"
              fill="url(#glass-highlight)"
              opacity={motion.shimmer}
              transform="rotate(13 230 250)"
            />
            <path
              d="M188 150 C225 138 252 154 265 195 C278 237 274 294 264 345 C255 390 254 454 266 517"
              fill="none"
              stroke="rgba(255, 255, 255, 0.34)"
              strokeWidth="8"
              strokeLinecap="round"
              opacity={0.34 + motion.shimmer * 0.52}
            />
          </g>

          <g fill="none" stroke="rgba(255, 245, 248, 0.42)" strokeLinecap="round" strokeLinejoin="round">
            <path d={BODY_PATH} strokeWidth="1.3" />
            <path d={LEFT_AURICLE_PATH} strokeWidth="1.1" />
            <path d={RIGHT_ATRIUM_PATH} strokeWidth="1.1" />
            <path d="M302 178 C300 140 304 108 315 75 C323 51 339 37 356 39 C373 41 385 57 386 79 C388 104 375 130 352 150" strokeWidth="1.1" />
          </g>
        </g>
      </svg>
    </div>
  );
}
