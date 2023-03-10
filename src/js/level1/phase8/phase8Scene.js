import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GridMapHelper } from '../../helpers/GridMapHelper'
import 
{
    degreeToRadians,
    resizeCanvasToDisplaySize,
    rotateActorLeft,
    rotateActorRight,
    sceneProperties, 
    translateActorBackward, 
    translateActorFoward,
    printOnConsole,
    loadGLBFile,
    loadOBJFile,
    getTotalTime,
    displayTime,
    checkPhaseContinuity,
    setTimeForNextPhase,
    rotateActorUTurn 
} from '../../helpers/Util'
import {editor,readOnlyState} from '../../components/global/editor'
import { parseCode } from '../level1Parser'
import { Modal } from 'bootstrap'
import { configureSaveLogModal } from '../nextLevelEntry/saveLog'

const logModal = new Modal(document.getElementById('logModal'))

var storedLevelValue = false

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, 2, 1, 1000)
camera.position.set(0,15,30)

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("sceneView")})

window.addEventListener( 'resize', function(){
    resizeCanvasToDisplaySize(renderer,camera);
}, false );

const ambientLight = new THREE.HemisphereLight('white','darkslategrey',0.5)

const mainLight = new THREE.DirectionalLight('white',0.7)
mainLight.position.set(2,1,1)

const controls = new OrbitControls(camera, renderer.domElement)

const gridMapHelper = new GridMapHelper()

const plane = gridMapHelper.createGridPlane()

var actorModelPath = new URL('../../../assets/models/eve.glb',import.meta.url).toString()
const actor = new THREE.Object3D()
loadGLBFile(actor,actorModelPath,"eve",2.0)
actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2))
actor.rotateY(degreeToRadians(90))

const objective1 = new THREE.Object3D()
var crystalModelPath = new URL('../../../assets/models/crystal.obj',import.meta.url).toString()
var crystalTexturePath = new URL('../../../assets/textures/crystal.jpg',import.meta.url).toString()
loadOBJFile(objective1,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective1.rotateX(degreeToRadians(-90))
const objective2 = new THREE.Object3D()
loadOBJFile(objective2,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective2.rotateX(degreeToRadians(-90))
objective1.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.0,gridMapHelper.getGlobalZPositionFromCoord(2))
objective2.position.set(gridMapHelper.getGlobalXPositionFromCoord(7),0.0,gridMapHelper.getGlobalZPositionFromCoord(8))
const objective3 = new THREE.Object3D()
loadOBJFile(objective3,crystalModelPath,'crystal',crystalTexturePath,2.0)
objective3.rotateX(degreeToRadians(-90))
objective3.position.set(gridMapHelper.getGlobalXPositionFromCoord(2),0.0,gridMapHelper.getGlobalZPositionFromCoord(5))

const boxGeometry = new THREE.BoxGeometry(6,2,2)
const boxGeometry2 = new THREE.BoxGeometry(4,2,2)
const boxMaterial = new THREE.MeshLambertMaterial({color: "rgb(0,255,0)"})

const box = new THREE.Mesh(boxGeometry,boxMaterial)
box.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),1.0,gridMapHelper.getGlobalXPositionFromCoord(7))

const box2 = new THREE.Mesh(boxGeometry2,boxMaterial)
box2.rotateY(degreeToRadians(90))
box2.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),1.0,gridMapHelper.getGlobalZPositionFromCoord(2.5))

const box3 = new THREE.Mesh(boxGeometry,boxMaterial)
box3.position.set(gridMapHelper.getGlobalXPositionFromCoord(2),1.0,gridMapHelper.getGlobalZPositionFromCoord(4))

const trapGeometry = new THREE.BoxGeometry(2,1,2)
const trapMaterial = new THREE.MeshLambertMaterial({color: "rgb(255,0,0)"})
const trap1 = new THREE.Mesh(trapGeometry,trapMaterial)
trap1.position.set(gridMapHelper.getGlobalXPositionFromCoord(1),0.5,gridMapHelper.getGlobalZPositionFromCoord(5))
gridMapHelper.addTrap(1,5)
const trap2 = new THREE.Mesh(trapGeometry,trapMaterial)
trap2.position.set(gridMapHelper.getGlobalXPositionFromCoord(6),0.5,gridMapHelper.getGlobalZPositionFromCoord(3))
gridMapHelper.addTrap(6,3)
const trap3 = new THREE.Mesh(trapGeometry,trapMaterial)
trap3.position.set(gridMapHelper.getGlobalXPositionFromCoord(5),0.5,gridMapHelper.getGlobalZPositionFromCoord(8))
gridMapHelper.addTrap(5,8)

gridMapHelper.addObstacle(5,7,7,7)
gridMapHelper.addObstacle(5,5,2,3)

scene.add(ambientLight)
scene.add(mainLight)
scene.add(plane)
scene.add(objective1)
scene.add(objective2)
scene.add(objective3)
scene.add(actor)
scene.add(box)
scene.add(box2)
scene.add(box3)
scene.add(trap1)
scene.add(trap2)
scene.add(trap3)

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
    let time = getTotalTime(sceneProperties.phaseTimer.getElapsedTime())
    displayTime(time)
}

async function andarFrente(amount)
{
    await translateActorFoward(actor,amount,gridMapHelper,sceneProperties)
}

async function andarTras(amount)
{
    await translateActorBackward(actor,amount,gridMapHelper,sceneProperties)
}

async function girarDireita()
{
    await rotateActorRight(actor,sceneProperties)
}

async function girarEsquerda()
{
    await rotateActorLeft(actor,sceneProperties)
}

async function darMeiaVolta()
{
    await rotateActorUTurn(actor,sceneProperties)
}

function checkCollision(object1,object2)
{
    if(gridMapHelper.getXCoordFromGlobalPosition(object1.position.x) == gridMapHelper.getXCoordFromGlobalPosition(object2.position.x) && gridMapHelper.getZCoordFromGlobalPosition(object1.position.z) == gridMapHelper.getZCoordFromGlobalPosition(object2.position.z))
    {
        return true
    }
    else
    {
        return false
    }
}

function coletarCristal()
{
    if(sceneProperties.cancelExecution)
    {
        return
    }

    if(checkCollision(actor,objective1))
    {
        objective1.visible = false
        printOnConsole("Cristal coletado.")
    }
    else if(checkCollision(actor,objective2))
    {
        objective2.visible = false
        printOnConsole("Cristal coletado.")
    }
    else if(checkCollision(actor,objective3))
    {
        objective3.visible = false
        printOnConsole("Cristal coletado.")
    }
    else
    {
        printOnConsole("Rob?? n??o est?? sobre o cristal.")
    }

    if(!objective1.visible && !objective2.visible && !objective3.visible)
    {
        printOnConsole("Todos os cristais coletados com sucesso!")
    }
}

function resetLevel()
{
    actor.position.set(gridMapHelper.getGlobalXPositionFromCoord(0),1.0,gridMapHelper.getGlobalZPositionFromCoord(2))
    actor.getObjectByName('eve').rotation.set(0,0,0)
    actor.rotation.set(0,degreeToRadians(90),0)
    objective1.visible = true
    objective2.visible = true
    objective3.visible = true
}

function winCondition()
{
    if(!objective1.visible && !objective2.visible && !objective3.visible)
    {
        return true
    }
    else
    {
        return false
    }
}

const execBtn = document.getElementById("execute")
execBtn.addEventListener("click",async function(){
    let codeParsed = parseCode(editor.state.doc.toString())
    sceneProperties.cancelExecution = false
    if(codeParsed != null)
    {
        resetLevel()
        document.getElementById("execute").disabled = true
        await eval(codeParsed)
        if(winCondition())
        {
            readOnlyState.doc = editor.state.doc
            editor.setState(readOnlyState)
            document.getElementById('winMessage').classList.remove('invisible')
            document.getElementById('advanceBtn').classList.remove('invisible')
            document.getElementById("reset").disabled = true
            sceneProperties.phaseTimer.stop()
        }
        else
        {
            document.getElementById("execute").disabled = false
        }
    }
})

const resetBtn = document.getElementById("reset")
resetBtn.addEventListener("click",function(){
    sceneProperties.cancelExecution = true
    resetLevel()
})

const clsConsoleBtn = document.getElementById("clsConsole")
clsConsoleBtn.addEventListener("click",function(){
    document.getElementById("console-printing").innerHTML = null
})

const advanceBtn = document.getElementById('advanceBtn')
advanceBtn.addEventListener('click',function(e){
    e.preventDefault()
    if(!storedLevelValue)
    {
        setTimeForNextPhase('/',getTotalTime(sceneProperties.phaseTimer.getElapsedTime()),true)
        storedLevelValue = true
    }
    alert("Parab??ns, voc?? terminou o primeiro n??vel do Projeto ELoS!")
    logModal.show()
    configureSaveLogModal(advanceBtn.href,'level1')
})

checkPhaseContinuity('/level1/phase8/')
resizeCanvasToDisplaySize(renderer,camera)
sceneProperties.phaseTimer.start()
animate()