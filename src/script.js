import * as THREE from 'three'
import GUI from 'lil-gui'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Debug
const gui = new GUI({ title: 'Galaxy controls', closeFolders: true })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const galaxyTexture = textureLoader.load('/particles/8.png')
const starsTexture = textureLoader.load('/particles/11.png')

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.size = 0.03
parameters.radius = 4
parameters.branches = 3
parameters.spin = 1.5
parameters.randomness = 0.45
parameters.randomnessPower = 5.5
parameters.insideColor = '#e27208'
parameters.outsideColor = '#6600ff'
parameters.rotate = true
parameters.rotationSpeed = 0.5

let galaxyGeometry = null
let galaxyMaterial = null
let galaxyPoints = null

const generateGalaxy = () => {
    /**
     * Destroy old galaxy
     */
    // Free the old geometry and material from memory
    if (galaxyGeometry !== null) {
        galaxyGeometry.dispose()
        galaxyMaterial.dispose()
        scene.remove(galaxyPoints)
    }

    /**
     * Geometry
     */
    galaxyGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const spinAngle = radius * parameters.spin

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    galaxyMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        alphaMap: galaxyTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    /**
     * Points
     */
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxyPoints)
}
generateGalaxy()

/**
 * Tweaks
 */
const particlesFolder = gui.addFolder('Particles')
particlesFolder.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy).name('Count')
particlesFolder.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name('Size')

const shapeFolder = gui.addFolder('Shape')
shapeFolder.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy).name('Radius')
shapeFolder.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy).name('Branches')
shapeFolder.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy).name('Spin')
shapeFolder.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy).name('Randomness')
shapeFolder.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy).name('Randomness power')

const colorsFolder = gui.addFolder('Colors')
colorsFolder.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy).name('Inside')
colorsFolder.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy).name('Outside')

const animationFolder = gui.addFolder('Animation')
animationFolder.add(parameters, 'rotate').name('Rotate')
animationFolder.add(parameters, 'rotationSpeed').min(-3).max(3).step(0.001).name('Speed')

/**
 * Stars
 */
const starsCount = 1000
const starsMinDistance = 10
const starsMaxDistance = 80

// Geometry
const starsGeometry = new THREE.BufferGeometry()

const starsPositions = new Float32Array(starsCount * 3)

const starsColors = new Float32Array(starsCount * 3)
const starsPalette = ['#1d3d8d', '#92afec', '#ffffff', '#ebecc9', '#feeb74', '#f1975c', '#d4362e']

for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3

    // Position
    const starDirection = new THREE.Vector3().randomDirection()
    const starDistance = Math.random() * (starsMaxDistance - starsMinDistance) + starsMinDistance

    starsPositions[i3] = starDirection.x * starDistance
    starsPositions[i3 + 1] = starDirection.y * starDistance
    starsPositions[i3 + 2] = starDirection.z * starDistance

    // Color
    const colorIndex = Math.floor(Math.random() * starsPalette.length)
    const starColor = new THREE.Color(starsPalette[colorIndex])

    starsColors[i3] = starColor.r
    starsColors[i3 + 1] = starColor.g
    starsColors[i3 + 2] = starColor.b
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))
starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3))

// Material
const starsMaterial = new THREE.PointsMaterial({
    size: 0.4,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    alphaMap: starsTexture,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})

// Points
const starsPoints = new THREE.Points(starsGeometry, starsMaterial)
scene.add(starsPoints)

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
camera.position.x = 3.5
camera.position.y = 3.5
camera.position.z = 3.5
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
let previousTime = 0
let rotationAngle = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Rotate galaxy
    if (parameters.rotate) {
        rotationAngle += deltaTime * parameters.rotationSpeed
    }
    galaxyPoints.rotation.x = Math.sin(rotationAngle) * 0.15
    galaxyPoints.rotation.y = rotationAngle
    galaxyPoints.rotation.z = Math.cos(rotationAngle) * 0.15

    // Rotate stars
    starsPoints.rotation.x = rotationAngle * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
