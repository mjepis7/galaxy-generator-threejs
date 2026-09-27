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
global.count = 100000
global.size = 0.01
global.radius = 4
global.branches = 3
global.spin = 1.5
global.randomness = 0.45
global.randomnessPower = 5.5
global.insideColor = '#e27208'
global.outsideColor = '#6600ff'

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
    const colors = new Float32Array(global.count * 3)

    const colorInside = new THREE.Color(global.insideColor)
    const colorOutside = new THREE.Color(global.outsideColor)

    for (let i = 0; i < global.count; i++) {
        const i3 = i * 3 

        // Position
        const radius = Math.random() * global.radius
        const branchAngle = (i % global.branches) / global.branches * Math.PI * 2
        const spinAngle = radius * global.spin

        const randomX = Math.pow(Math.random(), global.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * global.randomness * radius
        const randomY = Math.pow(Math.random(), global.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * global.randomness * radius
        const randomZ = Math.pow(Math.random(), global.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * global.randomness * radius

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / global.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: global.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
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
gui.add(global, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy).name('Galaxy radius')
gui.add(global, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy).name('Galaxy branches')
gui.add(global, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy).name('Galaxy spin')
gui.add(global, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy).name('Galaxy randomness')
gui.add(global, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy).name('Galaxy randomness power')
gui.addColor(global, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(global, 'outsideColor').onFinishChange(generateGalaxy)

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
camera.position.x = 3
camera.position.y = 3
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
