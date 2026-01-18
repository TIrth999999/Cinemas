import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './notFound404.css'

const NotFound404 = () => {
    const navigate = useNavigate()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLocked, setIsLocked] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const isRedirecting = useRef(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (!canvasRef.current || isMobile) return

        // Import Three.js from CDN
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
        script.async = true

        script.onload = () => {
            // Load PointerLockControls after Three.js
            const controlsScript = document.createElement('script')
            controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/PointerLockControls.js'
            controlsScript.async = true

            controlsScript.onload = () => {
                initWalkableScene()
            }

            document.head.appendChild(controlsScript)
        }

        const initWalkableScene = () => {
            // @ts-ignore
            const THREE = window.THREE

            // Movement State
            const moveState = {
                forward: false,
                backward: false,
                left: false,
                right: false
            }

            const velocity = new THREE.Vector3()
            const direction = new THREE.Vector3()

            // Scene Dimensions
            const ROOM_WIDTH = 22
            const ROOM_DEPTH = 32
            const ROOM_HEIGHT = 9

            const scene = new THREE.Scene()
            scene.background = new THREE.Color(0x050505)
            scene.fog = new THREE.FogExp2(0x050505, 0.02)

            const camera = new THREE.PerspectiveCamera(
                75,
                canvasRef.current!.clientWidth / canvasRef.current!.clientHeight,
                0.1,
                100
            )
            // START POSITION: Grounded at the back aisle
            camera.position.set(0, 1.7, 13)

            const renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current!,
                antialias: true,
                powerPreference: "high-performance"
            })
            renderer.setSize(canvasRef.current!.clientWidth, canvasRef.current!.clientHeight)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            renderer.shadowMap.enabled = true
            renderer.shadowMap.type = THREE.PCFSoftShadowMap
            renderer.toneMapping = THREE.ACESFilmicToneMapping
            renderer.toneMappingExposure = 1.0

            // ==========================================
            // CONTROLS
            // ==========================================
            // @ts-ignore
            const controls = new THREE.PointerLockControls(camera, document.body)

            controls.addEventListener('lock', () => setIsLocked(true))
            controls.addEventListener('unlock', () => setIsLocked(false))

            // Automatic control lock on page entry
            const tryLock = () => {
                if (!isRedirecting.current) {
                    controls.lock()
                }
            }

            // Try auto-locking with a small delay
            setTimeout(tryLock, 500)

            // Fallback: Click anywhere to lock if auto-lock fails
            window.addEventListener('click', tryLock)

            const onKeyDown = (event: KeyboardEvent) => {
                switch (event.code) {
                    case 'ArrowUp':
                    case 'KeyW': moveState.forward = true; break
                    case 'ArrowLeft':
                    case 'KeyA': moveState.left = true; break
                    case 'ArrowDown':
                    case 'KeyS': moveState.backward = true; break
                    case 'ArrowRight':
                    case 'KeyD': moveState.right = true; break
                }
            }
            const onKeyUp = (event: KeyboardEvent) => {
                switch (event.code) {
                    case 'ArrowUp':
                    case 'KeyW': moveState.forward = false; break
                    case 'ArrowLeft':
                    case 'KeyA': moveState.left = false; break
                    case 'ArrowDown':
                    case 'KeyS': moveState.backward = false; break
                    case 'ArrowRight':
                    case 'KeyD': moveState.right = false; break
                }
            }
            document.addEventListener('keydown', onKeyDown)
            document.addEventListener('keyup', onKeyUp)

            // ==========================================
            // TEXTURES
            // ==========================================
            const textureLoader = new THREE.TextureLoader()

            // Carpet Texture
            const carpetBase = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/terrain/grasslight-big.jpg')
            carpetBase.wrapS = THREE.RepeatWrapping
            carpetBase.wrapT = THREE.RepeatWrapping
            carpetBase.repeat.set(10, 10)

            // Wall Texture
            const wallBase = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/brick_diffuse.jpg')
            wallBase.wrapS = THREE.RepeatWrapping
            wallBase.wrapT = THREE.RepeatWrapping
            wallBase.repeat.set(8, 4)
            const wallNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/brick_bump.jpg')
            wallNormal.wrapS = THREE.RepeatWrapping
            wallNormal.wrapT = THREE.RepeatWrapping
            wallNormal.repeat.set(8, 4)

            // Seat Fabric Texture
            const fabricBase = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/hardwood2_diffuse.jpg')
            fabricBase.wrapS = THREE.RepeatWrapping
            fabricBase.wrapT = THREE.RepeatWrapping
            fabricBase.repeat.set(2, 2)

            // ==========================================
            // LIGHTING
            // ==========================================
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
            scene.add(ambientLight)

            // Ceiling Grid Lights
            for (let x = -8; x <= 8; x += 8) {
                for (let z = -10; z <= 10; z += 10) {
                    const ceilingLight = new THREE.PointLight(0xffaa77, 0.5, 12)
                    ceilingLight.position.set(x, 8, z)
                    scene.add(ceilingLight)

                    const fixture = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 0.1, 1),
                        new THREE.MeshBasicMaterial({ color: 0xffffff })
                    )
                    fixture.position.set(x, 8.9, z)
                    scene.add(fixture)
                }
            }

            // ==========================================
            // ARCHITECTURE
            // ==========================================
            const wallMat = new THREE.MeshStandardMaterial({
                map: wallBase,
                normalMap: wallNormal,
                color: 0x555555,
                roughness: 0.8
            })
            const floorMat = new THREE.MeshStandardMaterial({
                map: carpetBase,
                color: 0x660000,
                roughness: 0.9
            })
            const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })

            // Floor
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), floorMat)
            floor.rotation.x = -Math.PI / 2
            floor.receiveShadow = true
            scene.add(floor)

            // Ceiling
            const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH), ceilingMat)
            ceiling.rotation.x = Math.PI / 2
            ceiling.position.y = ROOM_HEIGHT
            scene.add(ceiling)

            // Walls
            const wallsGroup = new THREE.Group()

            const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT), wallMat)
            leftWall.rotation.y = Math.PI / 2
            leftWall.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0)
            leftWall.receiveShadow = true
            wallsGroup.add(leftWall)

            const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT), wallMat)
            rightWall.rotation.y = -Math.PI / 2
            rightWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0)
            rightWall.receiveShadow = true
            wallsGroup.add(rightWall)

            const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT), wallMat)
            backWall.position.set(0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2)
            backWall.rotation.y = Math.PI
            backWall.receiveShadow = true
            wallsGroup.add(backWall)

            const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT), wallMat)
            frontWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2)
            frontWall.receiveShadow = true
            wallsGroup.add(frontWall)

            scene.add(wallsGroup)

            // ==========================================
            // GRAND EXIT DOOR
            // ==========================================
            const doorGroup = new THREE.Group()
            doorGroup.position.set(0, 0, ROOM_DEPTH / 2 - 0.1)

            const doorThickness = 0.3

            const doorMesh = new THREE.Mesh(
                new THREE.BoxGeometry(5, 7, doorThickness),
                [
                    // Front
                    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 }),
                    // Back (INSIDE – PURE BLACK)
                    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1.0 }),
                    // Left
                    new THREE.MeshStandardMaterial({ color: 0x050505 }),
                    // Right
                    new THREE.MeshStandardMaterial({ color: 0x050505 }),
                    // Top
                    new THREE.MeshStandardMaterial({ color: 0x050505 }),
                    // Bottom
                    new THREE.MeshStandardMaterial({ color: 0x050505 })
                ]
            )

            doorMesh.position.set(0, 3.5, doorThickness / 2)
            doorMesh.castShadow = true
            doorMesh.receiveShadow = true
            doorGroup.add(doorMesh)

            // Grand Door Frame
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 })
            const frameTop = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 0.3), frameMat)
            frameTop.position.y = 7
            doorGroup.add(frameTop)

            const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7, 0.2), frameMat)
            frameLeft.position.set(-2.6, 3.5, 0)
            doorGroup.add(frameLeft)

            const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7, 0.2), frameMat)
            frameRight.position.set(2.6, 3.5, 0)
            doorGroup.add(frameRight)

            // EXIT Sign with Text
            const exitCanvas = document.createElement('canvas')
            exitCanvas.width = 256; exitCanvas.height = 128
            const exitCtx = exitCanvas.getContext('2d')!
            exitCtx.fillStyle = '#111111'
            exitCtx.fillRect(0, 0, 256, 128)
            exitCtx.fillStyle = '#00ff00'
            exitCtx.font = 'bold 80px Arial'
            exitCtx.textAlign = 'center'
            exitCtx.textBaseline = 'middle'
            exitCtx.fillText('EXIT', 128, 64)

            const exitTex = new THREE.CanvasTexture(exitCanvas)
            const exitSign = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.7, 0.3),
                new THREE.MeshStandardMaterial({
                    map: exitTex,
                    emissive: 0x00ff00,
                    emissiveIntensity: 3.0
                })
            )
            exitSign.position.y = 7.6
            doorGroup.add(exitSign)

            const exitLight = new THREE.PointLight(0x00ff00, 1.2, 10)
            exitLight.position.set(0, 7.6, 0.5)
            doorGroup.add(exitLight)

            scene.add(doorGroup)

            // ==========================================
            // SEATS & AUDIENCE
            // ==========================================
            const SEAT_WIDTH = 0.6
            const ROW_SPACING = 1.2
            const NUM_ROWS = 16
            const SEATS_PER_ROW_SIDE = 7

            const seatGeo = new THREE.BoxGeometry(SEAT_WIDTH, 0.15, 0.6)
            const seatBackGeo = new THREE.BoxGeometry(SEAT_WIDTH, 0.8, 0.1)
            const seatMat = new THREE.MeshStandardMaterial({
                map: fabricBase,
                color: 0x881111,
                roughness: 0.7
            })

            const totalSeats = NUM_ROWS * SEATS_PER_ROW_SIDE * 2
            const basesMesh = new THREE.InstancedMesh(seatGeo, seatMat, totalSeats)
            const backsMesh = new THREE.InstancedMesh(seatBackGeo, seatMat, totalSeats)
            basesMesh.castShadow = true; basesMesh.receiveShadow = true
            backsMesh.castShadow = true; backsMesh.receiveShadow = true

            // Humans in seats
            const bodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8)
            const headGeo = new THREE.SphereGeometry(0.15, 12, 12)

            const humanColors = [0x444444, 0x224466, 0x662222, 0x333333, 0x442244]
            const humanBodies = humanColors.map(c => new THREE.InstancedMesh(bodyGeo, new THREE.MeshStandardMaterial({ color: c }), totalSeats))
            const humanHeads = new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ color: 0xd2b48c }), totalSeats)

            humanBodies.forEach(b => {
                b.castShadow = true;
                scene.add(b)
            })
            humanHeads.castShadow = true
            scene.add(humanHeads)

            const dummy = new THREE.Object3D()
            const personBodyDummy = new THREE.Object3D()
            const personHeadDummy = new THREE.Object3D()

            let seatIdx = 0
            const SLOPE_START_ROW = 3
            const RISE_PER_ROW = 0.25

            for (let row = 0; row < NUM_ROWS; row++) {
                let yPos = 0
                if (row > SLOPE_START_ROW) {
                    yPos = (row - SLOPE_START_ROW) * RISE_PER_ROW
                }
                const zPos = -10 + (row * ROW_SPACING)

                const addInstance = (x: number, side: number) => {
                    // Seat Base
                    dummy.position.set(x, yPos + 0.3, zPos)
                    dummy.rotation.set(-0.1, side * 0.1, 0)
                    dummy.updateMatrix()
                    basesMesh.setMatrixAt(seatIdx, dummy.matrix)

                    // Seat Back
                    dummy.position.set(x, yPos + 0.7, zPos + 0.25)
                    dummy.rotation.set(-0.2, side * 0.1, 0)
                    dummy.updateMatrix()
                    backsMesh.setMatrixAt(seatIdx, dummy.matrix)

                    // Human (75% occupancy)
                    if (Math.random() < 0.75) {
                        const bodyIdx = Math.floor(Math.random() * humanBodies.length)
                        const lookRandom = (Math.random() - 0.5) * 0.3

                        personBodyDummy.position.set(x, yPos + 0.6, zPos)
                        personBodyDummy.rotation.set(0, side * 0.1 + lookRandom, 0)
                        personBodyDummy.updateMatrix()
                        humanBodies[bodyIdx].setMatrixAt(seatIdx, personBodyDummy.matrix)

                        personHeadDummy.position.set(x, yPos + 1.0, zPos)
                        personHeadDummy.rotation.set((Math.random() - 0.5) * 0.2, side * 0.1 + lookRandom * 2, 0)
                        personHeadDummy.updateMatrix()
                        humanHeads.setMatrixAt(seatIdx, personHeadDummy.matrix)
                    }

                    seatIdx++
                }

                // Left side
                for (let col = 0; col < SEATS_PER_ROW_SIDE; col++) {
                    addInstance(-2 - (col * (SEAT_WIDTH + 0.2)), 1)
                }
                // Right side
                for (let col = 0; col < SEATS_PER_ROW_SIDE; col++) {
                    addInstance(2 + (col * (SEAT_WIDTH + 0.2)), -1)
                }

                if (row > SLOPE_START_ROW) {
                    const riserHeight = yPos
                    const riser = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, riserHeight, ROW_SPACING), floorMat)
                    riser.position.set(0, riserHeight / 2, zPos + 0.1)
                    riser.receiveShadow = true
                    scene.add(riser)
                }
            }
            scene.add(basesMesh)
            scene.add(backsMesh)

            // ==========================================
            // SCREEN
            // ==========================================
            const screenCanvas = document.createElement('canvas')
            screenCanvas.width = 1024; screenCanvas.height = 576
            const ctx = screenCanvas.getContext('2d')!

            const drawScreen = () => {
                const grad = ctx.createRadialGradient(512, 288, 50, 512, 288, 600)
                grad.addColorStop(0, '#ffffff')
                grad.addColorStop(1, '#aaaaaa')
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, 1024, 576)

                ctx.fillStyle = '#000000'
                ctx.font = 'bold 200px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('404', 512, 300)
                ctx.font = '50px Arial'
                ctx.fillText('Page Not Found! Piche Dekho', 512, 450)
            }
            drawScreen()

            const screenTex = new THREE.CanvasTexture(screenCanvas)
            const screenMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(16, 9),
                new THREE.MeshStandardMaterial({ map: screenTex, emissive: 0xffffff, emissiveIntensity: 0.1 })
            )
            const screenZ = -ROOM_DEPTH / 2 + 0.5
            screenMesh.position.set(0, 5, screenZ)
            scene.add(screenMesh)

            // ==========================================
            // PROJECTOR & BEAM
            // ==========================================
            const boothPositionZ = ROOM_DEPTH / 2 - 2
            const boothY = 7

            const projBox = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1.5), new THREE.MeshStandardMaterial({ color: 0x111111 }))
            projBox.position.set(0, boothY, boothPositionZ)
            scene.add(projBox)

            const lensY = boothY
            const lensZ = boothPositionZ - 0.9
            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.3), new THREE.MeshStandardMaterial({ color: 0x333333 }))
            lens.rotation.x = Math.PI / 2
            lens.position.set(0, lensY, lensZ)
            scene.add(lens)

            // Soft Multi-layered Pyramid Beam
            const createPyramidBeam = (opacity: number, scale: number = 1) => {
                const beamGeo = new THREE.BufferGeometry()
                const apex = new THREE.Vector3(0, lensY, lensZ)
                const sw = 8 * scale, sh = 4.5 * scale
                const tl = new THREE.Vector3(-sw, 5 + sh, screenZ)
                const tr = new THREE.Vector3(sw, 5 + sh, screenZ)
                const br = new THREE.Vector3(sw, 5 - sh, screenZ)
                const bl = new THREE.Vector3(-sw, 5 - sh, screenZ)

                const vertices = new Float32Array([
                    apex.x, apex.y, apex.z,
                    tl.x, tl.y, tl.z,
                    tr.x, tr.y, tr.z,
                    br.x, br.y, br.z,
                    bl.x, bl.y, bl.z
                ])
                const indices = [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 1, 2, 3, 1, 3, 4]
                beamGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
                beamGeo.setIndex(indices)
                beamGeo.computeVertexNormals()

                return new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: opacity,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                }))
            }
            scene.add(createPyramidBeam(0.04, 1.0))
            scene.add(createPyramidBeam(0.02, 1.08)) // Glow layer

            // ==========================================
            // ANIMATION LOOP
            // ==========================================
            let prevTime = performance.now()
            const animate = () => {
                if (isRedirecting.current) return
                requestAnimationFrame(animate)

                const time = performance.now()
                const delta = (time - prevTime) / 1000

                if (controls.isLocked) {
                    velocity.x -= velocity.x * 10.0 * delta
                    velocity.z -= velocity.z * 10.0 * delta

                    direction.z = Number(moveState.forward) - Number(moveState.backward)
                    direction.x = Number(moveState.right) - Number(moveState.left)
                    direction.normalize()

                    if (moveState.forward || moveState.backward) velocity.z -= direction.z * 100.0 * delta
                    if (moveState.left || moveState.right) velocity.x -= direction.x * 100.0 * delta

                    controls.moveRight(-velocity.x * delta)
                    controls.moveForward(-velocity.z * delta)

                    // Height Logic
                    const zPos = camera.position.z
                    const rowVal = (zPos + 10) / 1.2
                    let fH = 0
                    if (rowVal > SLOPE_START_ROW) fH = (rowVal - SLOPE_START_ROW) * RISE_PER_ROW
                    if (fH < 0) fH = 0
                    camera.position.y += (fH + 1.7 - camera.position.y) * 10 * delta

                    // Grand Exit Door Logic
                    // Door is at Z=16. Wide threshold is 2.5m (door is 5m wide)
                    if (camera.position.z > ROOM_DEPTH / 2 - 2.5 && Math.abs(camera.position.x) < 2.5) {
                        isRedirecting.current = true
                        controls.unlock()
                        navigate('/home')
                    }

                    // Boundaries
                    if (camera.position.x < -ROOM_WIDTH / 2 + 2) camera.position.x = -ROOM_WIDTH / 2 + 2
                    if (camera.position.x > ROOM_WIDTH / 2 - 2) camera.position.x = ROOM_WIDTH / 2 - 2
                    if (camera.position.z < -ROOM_DEPTH / 2 + 2) camera.position.z = -ROOM_DEPTH / 2 + 2
                    if (camera.position.z > ROOM_DEPTH / 2 - 2) camera.position.z = ROOM_DEPTH / 2 - 2
                }
                prevTime = time
                renderer.render(scene, camera)
            }
            animate()

            const handleResize = () => {
                if (!canvasRef.current) return
                camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight
                camera.updateProjectionMatrix()
                renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
            }
            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('resize', handleResize)
                document.removeEventListener('keydown', onKeyDown)
                document.removeEventListener('keyup', onKeyUp)
                window.removeEventListener('click', tryLock)
            }
        }

        document.head.appendChild(script)
        return () => { if (document.head.contains(script)) document.head.removeChild(script) }
    }, [isMobile])

    if (isMobile) {
        return (
            <div className="notfound-mobile-container">
                <div className="notfound-mobile-content">
                    <h1>404</h1>
                    <h2>Oops! Page Not Found</h2>
                    <p>The cinematic adventure you're looking for doesn't exist.</p>
                    <button className="notfound-mobile-home-btn" onClick={() => navigate('/home')}>
                        <i className="fas fa-home"></i>
                        Return Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="notfound-3d-container">
            <canvas ref={canvasRef} className="notfound-3d-canvas"></canvas>

            {!isLocked && (
                <div className="notfound-lock-hint">
                    <p>Click anywhere to move</p>
                </div>
            )}

            <button
                className="notfound-home-btn"
                onClick={() => navigate('/home')}
                style={{ zIndex: 100 }}
            >
                <i className="fas fa-home"></i>
                Exit Theater
            </button>
        </div>
    )
}

export default NotFound404
