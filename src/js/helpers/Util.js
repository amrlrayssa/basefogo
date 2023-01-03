import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import * as Nodes from 'three/examples/jsm/nodes/Nodes'
import { GridMapHelper } from './GridMapHelper'

/**
 * Convert an angle from degree to radian.
 * @param {number} angle - The angle you wish to convert
 * @returns {number}
 */
export function degreeToRadians(angle)
{
    let radianAngle = angle * (Math.PI/180) 
    return radianAngle
}

/**
 * A function that resize the renderer and the camera's aspect to the canvas current size.
 * @param {THREE.WebGLRenderer} renderer - Scene's renderer
 * @param {THREE.PerspectiveCamera} camera - Scene's camera
 */
export function resizeCanvasToDisplaySize(renderer,camera)
{
    let canvas = renderer.domElement;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    if(canvas.width !== width ||canvas.height !== height) 
    {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

/**
 * An Object containing the general properties of a phase scene.
 * @namespace
 * @property {boolean} [cancelExecution=false] - Use this to verify if the user's code needs to be terminated before the end of the execution. Default is false.
 * @property {THREE.Clock} phaseTimer - The timer used specifically for a phase. Needs to be started.
 */
export var sceneProperties = {
    cancelExecution: false,
    phaseTimer: new THREE.Clock(false)
}

/**
 * A function to execute a lean movement to a indicated direction.
 * @param {THREE.Object3D} object - Object you want to execute the lean movement.
 * @param {boolean} [direction=true] - Change it's default value if you want the object to return to the origin rotation instead to lean. Default is true.
 * @param {number} [positionMultiplier=1] - Change the multiplier of the lean movement to reduce or increase the lean, the base value is 15 degrees. Change the default value to a negative one makes the Object leans backwards. Default is 1. 
 */
export function leanMovement(object,direction = true,positionMultiplier = 1)
{
    let objCopy = object.clone()
    if(direction)
    {
        objCopy.rotation.set(degreeToRadians(15*positionMultiplier),0,0)
    }
    else
    {
        objCopy.rotation.set(0,0,0)
    }
    let newPosition = new THREE.Quaternion()
    newPosition.setFromEuler(objCopy.rotation)
    let requestID
    function rotate()
    {
        if(!object.quaternion.equals(newPosition) && !sceneProperties.cancelExecution)
        {
            object.quaternion.slerp(newPosition,0.2)
            requestID = requestAnimationFrame(rotate)
        }
        else
        {
            cancelAnimationFrame(requestID)
        }
    }
    requestID = requestAnimationFrame(rotate)   
}


/**
 * A function to translate the actor in a positive direction.
 * @param {THREE.Object3D} actor - Object that will execute the translation.
 * @param {number} amount - Amount of grid square the object will translate.
 * @param {GridMapHelper} gridMapHelper - Phase's gridMapHelper object to detect collisions, traps and determine global positions.
 * @param {Object} sceneProperties - Phase's sceneProperties to determine if the execution needs to be terminated.
 * @param {boolean} sceneProperties.cancelExecution - Use this to verify if the user's code needs to be terminated before the end of the execution. Default is false.
 * @returns {Promise}
 */
export function translateActorFoward(actor,amount,gridMapHelper,sceneProperties)
{
    let objectCopy = actor.clone()
    objectCopy.translateZ(gridMapHelper.getMultiplier()*amount)
    let newPosition = objectCopy.position
    let requestID
    let alpha = 0.01
    leanMovement(actor.getObjectByName('eve'))
    return new Promise(function(resolve){
        function translateActor()
        {
            newPosition = gridMapHelper.collisionTests(actor.position,newPosition)
            let trap = gridMapHelper.trapCollision(actor.position)
            let fireHole = gridMapHelper.fireHoleCollision(actor.position)
            let hole = gridMapHelper.holeCollision(actor.position)
            if((actor.position.x.toFixed(2) != newPosition.x.toFixed(2)||actor.position.z.toFixed(2) != newPosition.z.toFixed(2)) && !sceneProperties.cancelExecution && !trap && !hole && !fireHole)
            {
                actor.position.lerp(newPosition,alpha)
                alpha += 0.001
                requestID = requestAnimationFrame(translateActor)
            }
            else
            {
                if(trap && !sceneProperties.cancelExecution)
                {
                    printOnConsole("Você caiu na armadilha.")
                    sceneProperties.cancelExecution = true   
                }
                leanMovement(actor.getObjectByName('eve'),false)
                cancelAnimationFrame(requestID)
                resolve()
            }
        }
        
        requestID = requestAnimationFrame(translateActor)
    })
}

/**
 * A function to translate the actor in a negative direction.
 * @param {THREE.Object3D} actor - Object that will execute the translation.
 * @param {number} amount - Amount of grid square the object will translate.
 * @param {GridMapHelper} gridMapHelper - Phase's gridMapHelper object to detect collisions, traps and determine global positions.
 * @param {Object} sceneProperties - Phase's sceneProperties to determine if the execution needs to be terminated.
 * @param {boolean} sceneProperties.cancelExecution - Use this to verify if the user's code needs to be terminated before the end of the execution. Default is false.
 * @returns {Promise}
 */
export function translateActorBackward(actor,amount,gridMapHelper,sceneProperties)
{
    let objectCopy = actor.clone()
    objectCopy.translateZ(-(gridMapHelper.getMultiplier()*amount))
    let newPosition = objectCopy.position
    let requestID
    let alpha = 0.01
    leanMovement(actor.getObjectByName('eve'),true,-1)
    return new Promise(function(resolve){
        function translateActor()
        {
            newPosition = gridMapHelper.collisionTests(actor.position,newPosition)
            let trap = gridMapHelper.trapCollision(actor.position)
            let fireHole = gridMapHelper.fireHoleCollision(actor.position)
            let hole = gridMapHelper.holeCollision(actor.position)
            if((actor.position.x.toFixed(2) != newPosition.x.toFixed(2)||actor.position.z.toFixed(2) != newPosition.z.toFixed(2)) && !sceneProperties.cancelExecution && !trap && !hole && !fireHole)
            {
                actor.position.lerp(newPosition,alpha)
                alpha += 0.001
                requestID = requestAnimationFrame(translateActor)
            }
            else
            {
                if(trap && !sceneProperties.cancelExecution)
                {
                    printOnConsole("Você caiu na armadilha.")
                    sceneProperties.cancelExecution = true   
                }
                leanMovement(actor.getObjectByName('eve'),false)
                cancelAnimationFrame(requestID)
                resolve()
            }
        }
        
        requestID = requestAnimationFrame(translateActor)
    })
}

/**
 * Rotate actor in -90 degrees.
 * @param {THREE.Object3D} actor 
 * @param {Object} sceneProperties - Phase's sceneProperties to determine if the execution needs to be terminated.
 * @param {boolean} sceneProperties.cancelExecution - Use this to verify if the user's code needs to be terminated before the end of the execution. Default is false. 
 * @returns {Promise}
 */
export function rotateActorRight(actor,sceneProperties)
{
    let objectCopy = actor.clone()
    objectCopy.rotateY(degreeToRadians(-90))
    let newPosition = new THREE.Quaternion()
    newPosition.setFromEuler(objectCopy.rotation)
    let requestID
    return new Promise(function(resolve){
        function rotateActor()
        {
            if(!actor.quaternion.equals(newPosition) && !sceneProperties.cancelExecution)
            {
                actor.quaternion.rotateTowards(newPosition,degreeToRadians(1))
                requestID = requestAnimationFrame(rotateActor)
            }
            else
            {
                cancelAnimationFrame(requestID)
                resolve()
            }
        }

        requestID = requestAnimationFrame(rotateActor)
    })
}

/**
 * Rotate actor in 90 degrees.
 * @param {THREE.Object3D} actor 
 * @param {Object} sceneProperties - Phase's sceneProperties to determine if the execution needs to be terminated.
 * @param {boolean} sceneProperties.cancelExecution - Use this to verify if the user's code needs to be terminated before the end of the execution. Default is false. 
 * @returns {Promise}
 */
export function rotateActorLeft(actor,sceneProperties)
{
    let objectCopy = actor.clone()
    objectCopy.rotateY(degreeToRadians(90))
    let newPosition = new THREE.Quaternion()
    newPosition.setFromEuler(objectCopy.rotation.clone())
    let requestID
    return new Promise(function(resolve){
        function rotateActor()
        {
            if(!actor.quaternion.equals(newPosition) && !sceneProperties.cancelExecution)
            {
                actor.quaternion.rotateTowards(newPosition,degreeToRadians(1))
                requestID = requestAnimationFrame(rotateActor)
            }
            else
            {
                cancelAnimationFrame(requestID)
                resolve()
            }
        }

        requestID = requestAnimationFrame(rotateActor)
    })
}

export function rotateActorUTurn(actor,sceneProperties)
{
    let objectCopy = actor.clone()
    objectCopy.rotateY(degreeToRadians(180))
    let newPosition = new THREE.Quaternion()
    newPosition.setFromEuler(objectCopy.rotation)
    let requestID
    return new Promise(function(resolve){
        function rotateActor()
        {
            if(!actor.quaternion.equals(newPosition) && !sceneProperties.cancelExecution)
            {
                actor.quaternion.rotateTowards(newPosition,degreeToRadians(1))
                requestID = requestAnimationFrame(rotateActor)
            }
            else
            {
                cancelAnimationFrame(requestID)
                resolve()
            }
        }

        requestID = requestAnimationFrame(rotateActor)
    })
}

/**
 * Prints something in the phase's console. This function will only work if the console HTML tag has the id "console-printing".
 * @example
 * <div id="console-printing">
 * </div>
 * @param {string} content - The content you want to print.
 */
export function printOnConsole(content)
{
    let consoleToPrint = document.getElementById("console-printing")
    consoleToPrint.innerHTML += `${content}<br>`
}

/**
 * This function will print an error message on the phase console, indicating the code and line. This function will only work on a HTML tag that has "console-printing" id.
 * @example
 * <div id="console-printing">
 * </div>
 * @param {string} content - The line content that the error ocurred.
 * @param {number} line - The line number that the error ocurred.
 */
 export function printErrorOnConsole(content,line)
 {
     let consoleToPrint = document.getElementById("console-printing")
     consoleToPrint.innerHTML += `Código Inválido:<br> ${content} linha: ${line}<br>`
 }

/**
 * Get the maximum size of a Mesh.
 * @param {THREE.Object3D} object - Object you want to get it's max size.
 * @returns {number}
 */
export function getMaxSize(object)
{
    let maxSize

    let box = new THREE.Box3().setFromObject(object)
    let min = box.min
    let max = box.max

    let size = new THREE.Box3()
    size.x = max.x - min.x
    size.y = max.y - min.y
    size.z = max.z - min.z

    if(size.x >= size.y && size.x >= size.z)
    {
        maxSize = size.x
    }
    else
    {
        if(size.y >= size.z)
        {
            maxSize = size.y
        }
        else
        {
            maxSize = size.z
        }
    }
    
    return maxSize
}

/**
 * Normalize object's default scale to the scene's measurements and rescale to a desired size.
 * @param {THREE.Object3D} object - Object to nomarlize and rescale.
 * @param {number} newScale - Desired new scale.
 */
export function normalizeAndRescale(object,newScale)
{
    let scale = getMaxSize(object)
    object.scale.set(newScale * 1.0/scale, newScale * 1.0/scale, newScale * 1.0/scale)
}

/**
 * Load a Mesh from a .glb File and a attach it to a Object3D.
 * @param {THREE.Object3D} objectToAdd - Object that will add the Mesh
 * @param {string} path - The file path. Right now we are using Parsel.js to bundle this project, so for the bundler import the file to the build you need to generate a relative URL in the js file you called this function.
 * @example 
 * var p = new URL('./relativePathtoTheFile',import.meta.url).toString()
 * loadGLBFile(obj,p,model,scale)
 * @param {string} modelName - The name the model will be called, this name can be used to get the Mesh loaded inside Object3D that attach it.
 * @param {number} scale - The size you want the model to have.
 */
export function loadGLBFile(objectToAdd,path,modelName,scale)
{
    let loader = new GLTFLoader()
    loader.load(path,function(gltf){
        let obj = gltf.scene
        obj.name = modelName
        obj.visible = true
        obj.traverse(function(child){
            if(child)
            {
                child.castShadow = true
            }
        })
        obj.traverse(function(node){
            if(node.material)
            {
                node.material.side = THREE.DoubleSide
            }
        })
        normalizeAndRescale(obj,scale)
        objectToAdd.add(obj)
    })
}

/**
 * Load a Mesh from a .obj File and a attach it to a Object3D.
 * @param {THREE.Object3D} objectToAdd - Object that will add the Mesh
 * @param {string} path - The file path. Right now we are using Parsel.js to bundle this project, so for the bundler import the file to the build you need to generate a relative URL in the js file you called this function.
 * @example 
 * var fp = new URL('./relativePathtoTheFile',import.meta.url).toString()
 * loadOBJFile(obj,fp,model,tp,scale)
 * @param {string} modelName - The name the model will be called, this name can be used to get the Mesh loaded inside Object3D that attach it.
 * @param {string} texture - The texture file path. Right now we are using Parsel.js to bundle this project, so for the bundler import the file to the build you need to generate a relative URL in the js file you called this function.
 * @example 
 * var tp = new URL('./relativePathtoTheFile',import.meta.url).toString()
 * loadOBJFile(obj,fp,model,tp,scale)
 * @param {number} scale - The size you want the model to have.
 */
export function loadOBJFile(objectToAdd,path,modelName,texture,scale)
{
    let objLoader = new OBJLoader()
    let textureLoader = new THREE.TextureLoader()
    let tex
    if(texture)
    {
        tex = textureLoader.load(texture)
    }
    objLoader.load(path,function(object){
        object.name = modelName
        object.visible = true
        object.traverse(function(child){
            if(child)
            {
                child.castShadow = true
            }
        })
        object.traverse(function(node){
            if(node.material)
            {
                node.material.side = THREE.DoubleSide
                if(texture)
                {
                    node.material.map = tex
                }
            }
        })
        normalizeAndRescale(object,scale)
        objectToAdd.add(object)
    })
}

/**
 * Check if the user is in the right phase based on what was stored in the browser's session storage.If it's not, the function will redirect the user to the address that was stored in the session storage or the index page.
 * @param {string} currentPhasePath - The path of the current phase, don't need the hole path, just subdirectory part.
 * @example
 * checkPhaseContinuity('/level1/phase1/')
 */
export function checkPhaseContinuity(currentPhasePath)
{
    let phasePath = window.sessionStorage.getItem('phasePath')
    if(phasePath != null)
    {
        if(phasePath != currentPhasePath)
        {
            document.location.href = '../..' + phasePath
        }
    }
    else
    {
        document.location.href = '../../'   
    }
}

/**
 * Returns the total time the user spent in the previous phases plus the current phase.
 * @param {number} time - The time spent in the current phase to be summed to previous times.
 * @returns {number}
 */
export function getTotalTime(time)
{
    let initialTime = parseFloat(window.sessionStorage.getItem('elapsedTime'))
    let totalTime = initialTime + time

    return totalTime
}

/**
 * Sets on the browser's session storage the next phase path, the total time spent until this phase. If it's the final phase, the function will clear the session storage.
 * @param {string} nextPhasePath - The path of the next phase, doesn't need the hole path, just subdirectory part.
 * @example
 * setTimeForNextPhase('/level1/phase2/',getTotalTime(timer.getElapsedTime()))
 * @param {number} time - The total time spent until this phase.
 * @param {boolean} [finalPhase=false] - Change it's default value if it's final phase of this level, it will make the function clear the session storage. Default is false.
 */
export function setTimeForNextPhase(nextPhasePath,time,finalPhase = false)
{
    if(!finalPhase)
    {
        window.sessionStorage.setItem('phasePath',nextPhasePath)
        window.sessionStorage.setItem('elapsedTime',time)
    }
    else
    {
        window.sessionStorage.setItem("levelTotalTime",time)
        window.sessionStorage.removeItem('phasePath')
        window.sessionStorage.removeItem('elapsedTime')
    }
}

/**
 * Display and update the timer in the format HH:MM:SS on the "timer" tag in the phase HTML file. This function will only work if there is a HTML tag in the phase that has a "timer" id.
 * @example
 * <div id="timer">
 * </div>
 * @param {number} time - The time that will be displayed.
 */
export function displayTime(time)
{
    let timerDisplay = document.getElementById("timer")
    let hour = Math.floor(time / 3600)
    let min = Math.floor(time / 60) % 60
    let seg = Math.floor(time % 60)
    timerDisplay.innerText = `Tempo: ${hour < 10 ? '0' + hour : hour}:${(min < 10 ? '0' + min : min)}:${(seg < 10 ? '0' + seg : seg)}`
}