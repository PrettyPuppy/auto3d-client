import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'

export function visibleHeightAtZDepth(depth, camera) {
    if (camera.isOrthographicCamera) {
        return Math.abs(camera.top - camera.bottom)
    }

    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z
    if (depth < cameraOffset) {
        depth -= cameraOffset
    } else {
        depth += cameraOffset
    }

    // vertical fov in radians
    const vFOV = (camera.fov * Math.PI) / 180

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

export function visibleWidthAtZDepth(depth, camera) {
    if (camera.isOrthographicCamera) {
        return Math.abs(camera.right - camera.left)
    }

    const height = visibleHeightAtZDepth(depth, camera)
    return height * camera.aspect
}

// extract all geometry from a gltf scene
export function extractGeometry(gltf) {
    const geometries = []
    gltf.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry

            // Check if the geometry has the required attributes

            const colorAttribute = geometry.attributes.color
            const normalAttribute = geometry.attributes.normal
            const uvAttribute = geometry.attributes.uv

            // Define default values for missing attributes

            const defaultColor = new THREE.Float32BufferAttribute([1, 1, 1], 3)
            const defaultNormal = new THREE.Float32BufferAttribute([0, 0, 1], 3)
            // const defaultUV = new THREE.Float32BufferAttribute([0, 0], 2)

            if (!colorAttribute) {
                geometry.setAttribute('color', defaultColor)
            }
            if (!normalAttribute) {
                geometry.setAttribute('normal', defaultNormal)
            }
            if (!uvAttribute) {
                const uvs = new Float32Array(geometry.attributes.position.count * 2)
                const positions = geometry.attributes.position.array

                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i]
                    const z = positions[i + 2]
                    const u = x
                    const v = z
                    uvs[(i / 3) * 2] = u
                    uvs[(i / 3) * 2 + 1] = v
                }
                geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
            }
            geometries.push(geometry)
        }
    })

    return mergeBufferGeometries(geometries)
}

// promise wrapper of the GLTFLoader
export function loadGltf(url) {
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(url, resolve, null, reject)
    })
}

export function extractCustomGeometry(gltf) {
    const geometries = []

    gltf.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry

            const colorAttribute = geometry.attributes.color
            const normalAttribute = geometry.attributes.normal
            const uvAttribute = geometry.attributes.uv

            if (geometry) {
                // Check if the geometry has the required attributes
                const attributes = geometry.attributes
                let uvs
                if (!normalAttribute) {
                    geometry.setAttribute('normal', defaultNormal)
                }

                if (attributes && attributes.position) {
                    // Create a new geometry with only the "position" attribute
                    const positionOnlyGeometry = new THREE.BufferGeometry()
                    positionOnlyGeometry.setAttribute('position', attributes.position)
                    positionOnlyGeometry.setAttribute('normal', attributes.normal)

                    uvs = new Float32Array(attributes.position.count * 2)
                    const positions = attributes.position.array
                    for (let i = 0; i < positions.length; i += 3) {
                        const x = positions[i]
                        const z = positions[i + 2]
                        const u = x
                        const v = z
                        uvs[(i / 3) * 2] = u
                        uvs[(i / 3) * 2 + 1] = v
                    }
                    positionOnlyGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
                    geometries.push(positionOnlyGeometry)
                }
            }
        }
    })

    // Merge the geometries if needed
    if (geometries.length > 1) {
        return mergeBufferGeometries(geometries)
    } else if (geometries.length === 1) {
        return geometries[0]
    }

    return null
}
