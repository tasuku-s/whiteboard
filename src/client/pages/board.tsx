import * as React from 'react'
import { useEffect, useMemo, useState } from 'react';

import * as handpose from '@tensorflow-models/handpose';

import './board.scss';
import { Subject } from 'rxjs';

import Canvas from '../component.tsx/canvas'

interface Finger {
  thumb?: { x: number, y: number }[];
  indexFinger?: { x: number, y: number }[];
  middleFinger?: { x: number, y: number }[];
  ringFinger?: { x: number, y: number }[];
  pinky?: { x: number, y: number }[];
}

const BoardPageComponent = () => {
  const eventBus = useMemo<Subject<handpose.AnnotatedPrediction[]>>(() => new Subject(), [])
  const [videoBox, setVideoBox] = useState<{width: number, height: number}>();

  useEffect(() => {
    (async () =>  {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' }
      })
      await import('@tensorflow/tfjs-backend-webgl');
      const m = await handpose.load();
      const video = document.createElement('video');
      video.srcObject = stream;
      video.style.position = 'absolute';
      video.style.transform = 'scaleX(-1)';
      video.style.opacity = '0.5';
      document.body.appendChild(video)

      const reflectPoint = async () => {
        const pos = await m.estimateHands(video)
        if (pos.length > 0) {
          eventBus.next(pos);
        }
        // setTimeout(reflectPoint, 500)
        requestAnimationFrame(reflectPoint)
      }
      video.onloadedmetadata = () => {
        video.play()
        setVideoBox({width: video.videoWidth, height: video.videoHeight})
        console.log({width: video.videoWidth, height: video.videoHeight})
      }
      video.onloadeddata = reflectPoint;
    })()
  }, []);

  return (
    <div className="board">
      {videoBox && <Canvas eventBus={eventBus} videoBox={videoBox} />}
    </div>
  )
};

export default BoardPageComponent;
