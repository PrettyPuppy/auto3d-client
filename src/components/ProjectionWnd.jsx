import * as THREE from 'three';
import WebGLApp from '../libs/WebGLApp';
import { extractGeometry } from '../libs/utils';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { useEffect, useRef } from 'react';

const ProjectionWnd = ({ model, projectFront, projectBack }) => {

    console.log(model)

    const previewRef = useRef(null);
    const ref = useRef(false);

    const myObjects = {
        path: model,
        front: projectFront,
        back: projectBack,
        texPos: new THREE.Vector2(0),
        texScale: new THREE.Vector2(1, 1),
        texPosBack: new THREE.Vector2(0),
        texScaleBack: new THREE.Vector2(1, 1),
    }

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
                const loader = new FBXLoader()
                const gltf = await loader.loadAsync(myObjects.path, (object) => { }, (xhr) => { }, (err) => { });
                console.log('>>> ', gltf)
                let geometry = extractGeometry(gltf)

                let geometry1 = new THREE.BufferGeometry()
                let vertices1 = []
                let normals1 = []
                let uvs1 = []
                let indices1 = []

                const geometry2 = new THREE.BufferGeometry()
                const vertices2 = []
                const normals2 = []
                const uvs2 = []
                const indices2 = []

                const texture = new THREE.TextureLoader().load(myObjects.front)
                const texture1 = new THREE.TextureLoader().load(myObjects.back)
                const texScale = myObjects.texScale
                const texPos = myObjects.texPos
                const texScaleBack = myObjects.texScaleBack
                const texPosBack = myObjects.texPosBack

                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping

                texture1.wrapS = THREE.RepeatWrapping
                texture1.wrapT = THREE.RepeatWrapping

                texture1.repeat.x *= -1

                const material1 = new THREE.MeshBasicMaterial({
                    map: texture,
                })
                const material2 = new THREE.MeshBasicMaterial({
                    map: texture1,
                })

                geometry.groups = []
                if (geometry && material1) {
                    const vertices = geometry.attributes.position.array

                    let minX = Infinity
                    let minZ = Infinity
                    let maxX = -Infinity
                    let maxZ = -Infinity

                    for (let i = 0; i < vertices.length; i += 3) {
                        const x = vertices[i + 0]
                        const z = vertices[i + 2]
                        minX = Math.min(minX, x)
                        minZ = Math.min(minZ, z)
                        maxX = Math.max(maxX, x)
                        maxZ = Math.max(maxZ, z)
                    }

                    const width = (maxX - minX)
                    const depth = (maxZ - minZ)

                    const uvs = geometry.attributes.uv.array

                    for (let i = 0; i < uvs.length; i += 2) {
                        const x = vertices[(i / 2) * 3 + 0]
                        const z = vertices[(i / 2) * 3 + 2]

                        const u = (x - minX)
                        const v = (z - minZ)

                        uvs[i] = u
                        uvs[i + 1] = v
                    }
                    for (let i = 0; i < uvs.length; i += 2) {

                        const dotProduct = vertices[(i / 2) * 3 + 1]
                        const someBuffer = 0.01

                        if (dotProduct < someBuffer && (i / 2) % 3 == 0) {
                            const v1Index = i / 2
                            const v2Index = i / 2 + 1
                            const v3Index = i / 2 + 2

                            vertices1.push(
                                geometry.attributes.position.array[v1Index * 3],
                                geometry.attributes.position.array[v1Index * 3 + 1],
                                geometry.attributes.position.array[v1Index * 3 + 2],
                                geometry.attributes.position.array[v2Index * 3],
                                geometry.attributes.position.array[v2Index * 3 + 1],
                                geometry.attributes.position.array[v2Index * 3 + 2],
                                geometry.attributes.position.array[v3Index * 3],
                                geometry.attributes.position.array[v3Index * 3 + 1],
                                geometry.attributes.position.array[v3Index * 3 + 2]
                            )
                            normals1.push(
                                geometry.attributes.normal.array[v1Index * 3],
                                geometry.attributes.normal.array[v1Index * 3 + 1],
                                geometry.attributes.normal.array[v1Index * 3 + 2],
                                geometry.attributes.normal.array[v2Index * 3],
                                geometry.attributes.normal.array[v2Index * 3 + 1],
                                geometry.attributes.normal.array[v2Index * 3 + 2],
                                geometry.attributes.normal.array[v3Index * 3],
                                geometry.attributes.normal.array[v3Index * 3 + 1],
                                geometry.attributes.normal.array[v3Index * 3 + 2]
                            )
                            uvs1.push(
                                ((uvs[v1Index * 2] + texPos.x) / (texScale.x * width)),
                                (uvs[v1Index * 2 + 1] + texPos.y) / (texScale.y * depth),
                                ((uvs[v2Index * 2] + texPos.x) / (texScale.x * width)),
                                (uvs[v2Index * 2 + 1] + texPos.y) / (texScale.y * depth),
                                ((uvs[v3Index * 2] + texPos.x) / (texScale.x * width)),
                                (uvs[v3Index * 2 + 1] + texPos.y) / (texScale.y * depth),
                            )
                            indices1.push(indices1.length, indices1.length + 1, indices1.length + 2)
                        } else if ((i / 2) % 3 == 0) {
                            // Assign material2
                            const v1Index = i / 2
                            const v2Index = i / 2 + 1
                            const v3Index = i / 2 + 2

                            vertices2.push(
                                geometry.attributes.position.array[v1Index * 3],
                                geometry.attributes.position.array[v1Index * 3 + 1],
                                geometry.attributes.position.array[v1Index * 3 + 2],
                                geometry.attributes.position.array[v2Index * 3],
                                geometry.attributes.position.array[v2Index * 3 + 1],
                                geometry.attributes.position.array[v2Index * 3 + 2],
                                geometry.attributes.position.array[v3Index * 3],
                                geometry.attributes.position.array[v3Index * 3 + 1],
                                geometry.attributes.position.array[v3Index * 3 + 2]
                            )
                            normals2.push(
                                geometry.attributes.normal.array[v1Index * 3],
                                geometry.attributes.normal.array[v1Index * 3 + 1],
                                geometry.attributes.normal.array[v1Index * 3 + 2],
                                geometry.attributes.normal.array[v2Index * 3],
                                geometry.attributes.normal.array[v2Index * 3 + 1],
                                geometry.attributes.normal.array[v2Index * 3 + 2],
                                geometry.attributes.normal.array[v3Index * 3],
                                geometry.attributes.normal.array[v3Index * 3 + 1],
                                geometry.attributes.normal.array[v3Index * 3 + 2]
                            )
                            uvs2.push(
                                ((uvs[v1Index * 2] + texPosBack.x) / (texScaleBack.x * width)),
                                (uvs[v1Index * 2 + 1] + texPosBack.y) / (texScaleBack.y * depth),
                                ((uvs[v2Index * 2] + texPosBack.x) / (texScaleBack.x * width)),
                                (uvs[v2Index * 2 + 1] + texPosBack.y) / (texScaleBack.y * depth),
                                ((uvs[v3Index * 2] + texPosBack.x) / (texScaleBack.x * width)),
                                (uvs[v3Index * 2 + 1] + texPosBack.y) / (texScaleBack.y * depth),
                            )
                            indices2.push(indices2.length, indices2.length + 1, indices2.length + 2)
                        }
                    }
                    geometry1.setAttribute('position', new THREE.Float32BufferAttribute(vertices1, 3))
                    geometry1.setAttribute('normal', new THREE.Float32BufferAttribute(normals1, 3))
                    geometry1.setAttribute('uv', new THREE.Float32BufferAttribute(uvs1, 2))
                    geometry1.setIndex(indices1)

                    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3))
                    geometry2.setAttribute('normal', new THREE.Float32BufferAttribute(normals2, 3))
                    geometry2.setAttribute('uv', new THREE.Float32BufferAttribute(uvs2, 2))
                    geometry2.setIndex(indices2)
                }

                const mergedGeometry = mergeBufferGeometries([geometry2, geometry1])
                mergedGeometry.groups = [
                    { start: 0, count: vertices2.length / 3, materialIndex: 1 },
                    { start: vertices2.length / 3, count: vertices1.length / 3, materialIndex: 0 },
                ]
                console.log(mergedGeometry)
                let mergedMesh = new THREE.Mesh(mergedGeometry, [material1, material2])
                webgl.scene.add(mergedMesh)

                mergedMesh.rotation.x -= Math.PI / 2

            }

            function saveAs(blob, filename) {
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = filename
                link.style.display = 'none'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(link.href)
            }

            function downloadGltf() {
                const exporter = new GLTFExporter()
                exporter.parse(
                    [webgl.scene],
                    async function (gltfJson) {
                        console.log('>>> GLTF Json', gltfJson)

                        const jsonString = JSON.stringify(gltfJson)

                        const blob = new Blob([jsonString], { type: 'application/json' })
                        console.log('Download requested');
                        console.log(blob);
                        const formData = new FormData();
                        formData.append('model', blob, `${sessionStorage.getItem('projectID')}.gltf`);
                        const sendGltf = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/project/uploadGltf/${sessionStorage.getItem('projectID')}`, {
                            method: 'post',
                            body: formData
                        })
                        if (sendGltf.ok) {
                            const data = await sendGltf.json();
                            console.log(data);
                        }
                    },
                    (e) => console.log(e),
                    { binary: false }
                )
            }

            setTimeout(() => downloadGltf(), 3000);

            selectNewObject();
            webgl.start();
        }
    }, [model, projectFront, projectBack]);

    return (
        <div id='preview' ref={previewRef} className="h-full">
        </div>
    )
}

export default ProjectionWnd;