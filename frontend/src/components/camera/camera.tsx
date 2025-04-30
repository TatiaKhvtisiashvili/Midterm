import { useRef, useState, useEffect } from "react";
import { DrawingUtils, FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import {AnswerDifficulty} from "../../types";
import styles from './camera.module.css';

const Camera = ({ onGestureDetected }: { onGestureDetected?: (gesture: AnswerDifficulty) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const showLandmarksRef = useRef(false);

    const [recognizer, setRecognizer] = useState<GestureRecognizer>();
    const [webcamRunning, setWebcamRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLandmarks, setShowLandmarks] = useState(false);
    const [lastGesture, setLastGesture] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
      showLandmarksRef.current = showLandmarks;
    }, [showLandmarks]);
   
    // Initialize recognizer (only once)
    useEffect(() => {
        const initializeRecognizer = async () => {
            try {
                setLoading(true);
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );

                const recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "/gesture_recognizer.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO"
                });

                setRecognizer(recognizer);
            } catch (err) {
                console.error("Recognizer initialization failed:", err);
                setError("Failed to initialize gesture recognition");
            } finally {
                setLoading(false);
            }
        };

        initializeRecognizer();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            stopWebcam();
        };
    }, []);

    // Handle camera activation state
    useEffect(() => {
        if (cameraActive) {
            startWebcam();
        } else {
            stopWebcam();
        }
    }, [cameraActive]);

    const startWebcam = async () => {
        if (!recognizer || webcamRunning) return;

        try {
            setLoading(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await new Promise((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadeddata = resolve;
                    }
                });

                if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                }

                setWebcamRunning(true);
                predictWebcam();
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera");
            setCameraActive(false);
        } finally {
            setLoading(false);
        }
    };

    const stopWebcam = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setWebcamRunning(false);
        setLastGesture(null);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const predictWebcam = async () => {
        if (!videoRef.current || !canvasRef.current || !recognizer) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        try {
            const results = recognizer.recognizeForVideo(videoRef.current, Date.now());

            // Update canvas drawing
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtx.translate(canvasRef.current.width, 0);
            canvasCtx.scale(-1, 1);

            const drawingUtils = new DrawingUtils(canvasCtx);
            if (showLandmarksRef.current && results.landmarks) {
                for (const landmarks of results.landmarks) {
                    drawingUtils.drawConnectors(
                        landmarks,
                        GestureRecognizer.HAND_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 2 }
                    );
                    drawingUtils.drawLandmarks(landmarks, {
                        color: '#FF0000',
                        lineWidth: 1,
                        radius: 2
                    });
                }
            }

            canvasCtx.restore();

            // Check for gestures and map to difficulty levels
             if (results.gestures.length > 0) {
                const bestGesture = results.gestures[0][0];
                if (bestGesture.score > 0.7) {
                    const detectedGesture = bestGesture.categoryName.toLowerCase();
                    let gestureDisplay = '';
                    let difficulty: AnswerDifficulty | null = null;
                    
                    // Map gestures to difficulty levels
                    if (detectedGesture.includes('thumb_up')) {
                        gestureDisplay = '👍 Easy';
                        difficulty = 2; // AnswerDifficulty.Easy
                    } else if (detectedGesture.includes('thumb_down')) {
                        gestureDisplay = '👎 Wrong';
                        difficulty = 0; // AnswerDifficulty.Wrong
                    } else if (detectedGesture.includes('palm') || detectedGesture.includes('open')) {
                        gestureDisplay = '✋ Hard';
                        difficulty = 1; // AnswerDifficulty.Hard
                    }
                    
                    if (difficulty !== null) {
                        setLastGesture(gestureDisplay);
                        if (onGestureDetected) {
                            onGestureDetected(difficulty);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Recognition error:', error);
        }

        animationFrameRef.current = requestAnimationFrame(predictWebcam);
    };

    const toggleCamera = () => {
        setCameraActive(!cameraActive);
    };

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <p>Please check:</p>
                <ul>
                    <li>Camera permissions are granted</li>
                    <li>Model file exists in public folder</li>
                    <li>Internet connection is stable</li>
                </ul>
            </div>
        );
    }

    return (
        <div className={styles.outerdiv}>
            <div className={styles.cameraContainer}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={styles.videoElement}
                    style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                    ref={canvasRef}
                    className={styles.canvasElement}
                    style={{ display: webcamRunning ? 'block' : 'none' }}
                />
                {loading && <div className={styles.loadingOverlay}>Initializing...</div>}
            </div>

            <div className={styles.controls}>
                <button 
                    onClick={toggleCamera}
                    className={`${styles.toggleButton} ${
                        cameraActive ? styles.toggleButtonActive : ''
                    }`}
                    disabled={loading}
                >
                    {cameraActive ? "Turn Camera Off" : "Turn Camera On"}
                </button>
                
                {webcamRunning && (
                    <button 
                        onClick={() => setShowLandmarks(prev => !prev)}
                        className={styles.landmarkButton}
                    >
                        {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
                    </button>
                )}
                
                <div className={styles.gestureFeedback}>
                    {lastGesture ? (
                        <>Last detected: <strong>{lastGesture}</strong></>
                    ) : (
                        "No gesture detected"
                    )}
                </div>

                 </div>
        </div>
    );
};

export default Camera;