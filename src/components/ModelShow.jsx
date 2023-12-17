import * as THREE from 'three';
import WebGLApp from '../libs/WebGLApp';
import { extractGeometry } from '../libs/utils';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { useEffect, useRef } from 'react';

const ModelShow = ({ model }) => {

    const previewRef = useRef(null);
    const ref = useRef(false);

    useEffect(() => {
        const myWnd = previewRef.current;
        console.log('>>> Canvas Window :', myWnd)
        if (myWnd) {
            console.log('Preview');

            if (ref.current) return;
            ref.current = true;

            console.log(myWnd.clientHeight)
            const canvas = document.createElement('canvas');
            myWnd.innerHTML = '';
            myWnd.appendChild(canvas);
            console.log(myWnd.clientHeight)

            const webgl = new WebGLApp({
                canvas,
                background: '#050505',
                showFps: true,
                orbitControls: true,
                width: myWnd.clientWidth,
                height: myWnd.clientHeight
            })

            console.log(webgl)

            window.webgl = webgl;

            const selectNewObject = async () => {
                webgl.scene.clear()
                const myGLTF = await new GLTFLoader().loadAsync(model, (object) => {}, (xhr) => {}, (err) => {});
                console.log('>>> My GLTF', myGLTF.scene);

                webgl.scene.add(myGLTF.scene)
            }

            selectNewObject();
            webgl.start();
        }
    }, [model]);

    return (
        <div id='preview' ref={previewRef} className="h-full">
        </div>
    )
}

export default ModelShow;