import * as THREE from 'three'
import GUI from 'lil-gui'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Debug
const gui = new GUI({ title: 'Galaxy controls' })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const global = {}
global.count = 10000
global.size = 0.001
global.radius = 5
global.branches = 3
global.spin = 1

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    /**
     * Destroy old galaxy
     */
    if (geometry !== null) {
        geometry.dispose() // dispose the object from memory
        material.dispose() // dispose the object from memory
        scene.remove(points)
    } 

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(global.count * 3)

    for (let i = 0; i < global.count; i++) {
        const i3 = i * 3 

        const radius = Math.random() * global.radius
        const branchAngle = (i % global.branches) / global.branches * Math.PI * 2
        const spinAngle = radius * global.spin

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: global.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()

gui.add(global, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy).name('Particle count')
gui.add(global, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name('Particle size')
gui.add(global, 'radius').min(0.01).max(20).step(0.001).onFinishChange(generateGalaxy).name('Galaxy radius')
gui.add(global, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy).name('Galaxy branches')
gui.add(global, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy).name('Galaxy spin')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
