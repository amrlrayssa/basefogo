import * as THREE from 'three'
import { degreeToRadians, printOnConsole } from './Util'

/**
 * Class that creates and manages a NxN Gridded Square Plane, defining dimension, colors and obstacles.
 */
export class GridMapHelper {
    
    /**
     * Creates a GridMapHelper object
     * @param {number} [divisions=10] - Number of divisions the X and Z axis will have. Default is 10
     * @param {string} [divisionsColor="rgb(0,0,0)"] - Color of the divisions lines in plane. Default is "rgb(0,0,0)".
     * @param {string} [planeColor="rgb(200,200,200)"] -  Color of the plane. Default is "rgb(200,200,200)"
     */
    constructor(divisions = 10, divisionsColor = "rgb(0,0,0)", planeColor = "rgb(200,200,200)")
    {
        this.divisions = divisions
        this.divisionsColor = divisionsColor
        this.planeColor = planeColor
        this.initialX = (divisions - 1) * -1
        this.initialZ = (divisions - 1) * -1
        this.endX = divisions - 1
        this.endZ = divisions - 1
        this.obstacles = []
        this.traps = []
        this.holes = []
        this.fireHoles = []
    }
    
    /**
     * Returns the mesh plane previously constructed in the class.
     * @returns {THREE.Mesh<THREE.PlaneGeometry,THREE.MeshLambertMaterial>} 
     */
    createGridPlane()
    {
        let planeGeometry = new THREE.PlaneGeometry(this.getMultiplier()*this.divisions,this.getMultiplier()*this.divisions,this.divisions,this.divisions)

        let grid = new THREE.GridHelper(this.getMultiplier()*this.divisions,this.divisions,this.divisionsColor,this.divisionsColor)
        grid.rotateX(degreeToRadians(90))
        grid.translateY(0.02)

        let planeMaterial = new THREE.MeshLambertMaterial({color: this.planeColor, side: THREE.DoubleSide})

        let plane = new THREE.Mesh(planeGeometry,planeMaterial)
        plane.add(grid)
        plane.receiveShadow = true
        plane.rotateX(degreeToRadians(-90))

        return plane
    }

    /**
     * Get the global X position of the scene based on the grid coordinate.
     * @param {number} xcoord - X coordinate of the grid
     * @returns {number}
     */
    getGlobalXPositionFromCoord(xcoord)
    {
        let pos = this.initialX + this.getMultiplier()*xcoord
        return pos
    }

    /**
     * Get the global Z position of the scene based on the grid coordinate.
     * @param {number} zcoord - Z coordinate of the grid
     * @returns {number}
     */
    getGlobalZPositionFromCoord(zcoord)
    {
        let pos = this.initialZ + this.getMultiplier()*zcoord
        return pos
    }

    /**
     * Get the X coordinate in grid based on the global X position in scene.
     * @param {number} x - Global X position in scene.
     * @param {number} [mode=0] - The method that the function will adjust the float number to a integer. 
     * Modes:
     * 0 stands for round;
     * 1 stands floor; 
     * 2 stands for ceil. 
     * Default is 0.
     * @returns {number} 
     */
    getXCoordFromGlobalPosition(x,mode = 0)
    {
        let coord
        if(mode == 1)
        {
            coord = Math.floor((Math.floor(x) - this.initialX)/this.getMultiplier())
        }
        else if(mode == 2)
        {
            coord = Math.ceil((Math.ceil(x) - this.initialX)/this.getMultiplier())   
        }
        else
        {
            coord = Math.round((Math.round(x) - this.initialX)/this.getMultiplier())    
        }
        return coord
    }

    /**
     * Get the Z coordinate in grid based on the global Z position in scene.
     * @param {number} z - Global Z position in scene.
     * @param {number} [mode=0] - The method that the function will adjust the float number to a integer. 
     * Modes:
     * 0 stands for round;
     * 1 stands floor; 
     * 2 stands for ceil. 
     * Default is 0.
     * @returns {number} 
     */
    getZCoordFromGlobalPosition(z,mode = 0)
    {
        let coord
        if(mode == 1)
        {
            coord = Math.floor((Math.floor(z) - this.initialZ)/this.getMultiplier())
        }
        else if(mode == 2)
        {
            coord = Math.ceil((Math.ceil(z) - this.initialZ)/this.getMultiplier())   
        }
        else
        {
            coord = Math.round((Math.round(z) - this.initialZ)/this.getMultiplier())
        }
        return coord   
    }

    /**
     * Get the multiplier of the global position to make the grid metrics.
     * @returns {2}
     */
    getMultiplier()
    {
        return 2
    }

    /**
     * Check if the X global position given is on the edge of the Grid Map.
     * @param {number} x - X global position.
     * @param {number} [mode] - The method that the function will adjust the float number to a integer. 
     * Modes:
     * 0 stands for round;
     * 1 stands floor; 
     * 2 stands for ceil. 
     * Default is 0. 
     * @returns {boolean}
     * @private
     */
    borderXOfMap(x,mode)
    {
        if(this.getXCoordFromGlobalPosition(x,mode) >= 0 && this.getXCoordFromGlobalPosition(x,mode) <= this.getXCoordFromGlobalPosition(this.endX))
        {
            return false
        }
        else
        {
            return true
        }
    }

    /**
     * Check if the Z global position given is on the edge of the Grid Map.
     * @param {number} z - Z global position.
     * @param {number} [mode] - The method that the function will adjust the float number to a integer. 
     * Modes:
     * 0 stands for round;
     * 1 stands floor; 
     * 2 stands for ceil. 
     * Default is 0. 
     * @returns {boolean}
     * @private
     */
    borderZOfMap(z,mode)
    {
        if(this.getXCoordFromGlobalPosition(z,mode) >= 0 && this.getXCoordFromGlobalPosition(z,mode) <= this.getXCoordFromGlobalPosition(this.endZ))
        {
            return false
        }
        else
        {
            return true
        }   
    }

    /**
     * Check if the actor reach one of the Map edges.
     * @param {THREE.Vector3} position - Current position of the actor.
     * @param {THREE.Vector3} newPosition - Destiny position of the actor.
     * @returns {boolean}
     * @private
     */
    borderMapCollision(position,newPosition)
    {
        let modeX = position.x >= newPosition.x ? 1 : 2
        let modeZ = position.z >= newPosition.z ? 1 : 2
        if(this.borderXOfMap(position.x,modeX)||this.borderZOfMap(position.z,modeZ))
        {
            return true
        }
        else
        {
            return false
        }
    }

    /**
     * Define a quadrangular space that the actor can't pass.
     * @param {number} minX - The smallest X coordinate the object will cover. 
     * @param {number} maxX - The largest X coordinate the object will cover.
     * @param {number} minZ - The smallest Z coordinate the object will cover.
     * @param {number} maxZ - The largest Z coordinate the object will cover.
     */
    addObstacle(minX,maxX,minZ,maxZ)
    {
        this.obstacles.push(
            {
                minX: minX,
                maxX: maxX,
                minZ: minZ,
                maxZ: maxZ
            }
        )
    }

    /**
     * Check if the actor is in collision route with an obstacle.
     * @param {THREE.Vector3} position - Current position of the actor.
     * @param {THREE.Vector3} newPosition - Destiny position of the actor.
     * @param {Object} obstacle - Obstacle analised at the moment.
     * @param {number} obstacle.minX - The smallest X coordinate the object will cover. 
     * @param {number} obstacle.maxX - The largest X coordinate the object will cover.
     * @param {number} obstacle.minZ - The smallest Z coordinate the object will cover.
     * @param {number} obstacle.maxZ - The largest Z coordinate the object will cover.
     * @returns {boolean}
     * @private
     */
    obstacleCollision(position,newPosition,obstacle)
    {
        let positionXCoord = this.getXCoordFromGlobalPosition(position.x)
        let positionZCoord = this.getZCoordFromGlobalPosition(position.z)
        let newPositionXCoord = this.getXCoordFromGlobalPosition(newPosition.x)
        let newPositionZCoord = this.getZCoordFromGlobalPosition(newPosition.z)

        let nextPosX
        let nextPosZ
        if(positionXCoord < newPositionXCoord)
        {
            nextPosX = positionXCoord + 1
        }
        else if(positionXCoord > newPositionXCoord)
        {
            nextPosX = positionXCoord - 1
        }
        else
        {
            nextPosX = positionXCoord
        }

        if(positionZCoord < newPositionZCoord)
        {
            nextPosZ = positionZCoord + 1
        }
        else if(positionZCoord > newPositionZCoord)
        {
            nextPosZ = positionZCoord - 1
        }
        else
        {
            nextPosZ = positionZCoord
        }

        if((nextPosX < obstacle.minX || nextPosZ < obstacle.minZ) || (nextPosX > obstacle.maxX || nextPosZ > obstacle.maxZ))
        {
            return false
        }
        else
        {
            return true
        }
    }

    /**
     * Defines a coordinate that causes a game over (or any event you want) if the actor steps on.
     * @param {number} x - X Coordinate 
     * @param {number} z - Z Coordinate
     */
    addTrap(x,z)
    {
        this.traps.push({
            x:x,
            z:z
        })
    }

    addHole(x,z)
    {
        let hole = {
            id: this.holes.length,
            x:x,
            z:z,
            active: true 
        }

        this.holes.push(hole)

        return hole.id
    }

    addFireHole(x,z)
    {
        let fireHole = {
            id: this.fireHoles.length,
            x:x,
            z:z,
            active: true
        }

        this.fireHoles.push(fireHole)

        return fireHole.id
    }

    holeCollision(position)
    {
        let activeHoles = this.holes.filter(hole => hole.active == true)
        for(let i = 0;i < activeHoles.length; i++)
        {
            if(this.getXCoordFromGlobalPosition(position.x) == activeHoles[i].x && this.getZCoordFromGlobalPosition(position.z) == activeHoles[i].z)
            {
                printOnConsole("Você caiu no buraco!")
                return true
            }
            else
            {
                continue
            }
        }
        
        return false
    }

    fireHoleCollision(position)
    {
        let activeFireHoles = this.fireHoles.filter(fireHole => fireHole.active == true)
        for(let i = 0;i < activeFireHoles.length; i++)
        {
            if(this.getXCoordFromGlobalPosition(position.x) == activeFireHoles[i].x && this.getZCoordFromGlobalPosition(position.z) == activeFireHoles[i].z)
            {
                printOnConsole("Robô foi queimado!")
                return true
            }
            else
            {
                continue
            }
        }
        
        return false
    }

    detectHole(position,type = "fire")
    {
        if(type == "fire")
        {
            let activeFireHoles = this.fireHoles.filter(fireHole => fireHole.active == true)
            for(let i = 0;i < activeFireHoles.length;i++)
            {
                if((Math.abs(this.getXCoordFromGlobalPosition(position.x) - activeFireHoles[i].x) == 1 && this.getZCoordFromGlobalPosition(position.z) == activeFireHoles[i].z) || (this.getXCoordFromGlobalPosition(position.x) == activeFireHoles[i].x && Math.abs(this.getZCoordFromGlobalPosition(position.z) - activeFireHoles[i].z) == 1))
                {
                    return activeFireHoles[i].id
                }
                else
                {
                    continue
                }
            }

            return null
        }
        else
        {
            let activeHoles = this.holes.filter(hole => hole.active == true)
            for(let i = 0;i < activeHoles.length;i++)
            {
                if((Math.abs(this.getXCoordFromGlobalPosition(position.x) - activeHoles[i].x) == 1 && this.getZCoordFromGlobalPosition(position.z) == activeHoles[i].z) || (this.getXCoordFromGlobalPosition(position.x) == activeHoles[i].x && Math.abs(this.getZCoordFromGlobalPosition(position.z) - activeHoles[i].z) == 1))
                {
                    return activeHoles[i].id
                }
                else
                {
                    continue
                }
            }

            return null   
        }
    }

    deactivateHole(position,type = "common")
    {
        let holeId = this.detectHole(position,type)

        if(holeId != null)
        {
            if(type == "common")
            {
                let pos = this.holes.map(hole => hole.id).indexOf(holeId)
                this.holes[pos].active = false
                return true
            }
            else if(type == "fire")
            {
                let pos = this.fireHoles.map(fireHole => fireHole.id).indexOf(holeId)
                this.fireHoles[pos].active = false
                return true  
            }
            else
            {
                console.log("tipo errado")
                return false
            }
        }
        else
        {
            printOnConsole("Não posso fazer isso aqui!")
            return false
        }
    }

    restartHoles()
    {
        for(let i = 0;i < this.holes.length;i++)
        {
            this.holes[i].active = true
        }

        for(let i = 0;i < this.fireHoles.length;i++)
        {
            this.fireHoles[i].active = true
        }
    }

    /**
     * Check if the actor stepped on a trap.
     * @param {THREE.Vector3} position - Current position of the actor.
     * @returns {boolean}
     */
    trapCollision(position)
    {
        for(let i = 0;i < this.traps.length;i++)
        {
            if(this.getXCoordFromGlobalPosition(position.x) == this.traps[i].x && this.getZCoordFromGlobalPosition(position.z) == this.traps[i].z)
            {
                return true
            }
            else
            {
                continue
            }
        }

        return false
    }

    /**
     * Check if the actor collided on the edge of the map or one of the obstacles.
     * @param {THREE.Vector3} position - Current position of the actor. 
     * @param {THREE.Vector3} newPosition - Destiny position of the actor.
     * @returns {boolean}
     */
    collisionTests(position,newPosition)
    {
        if(!this.borderMapCollision(position,newPosition))
        {
            for(let i = 0;i < this.obstacles.length;i++)
            {
                if(this.obstacleCollision(position,newPosition,this.obstacles[i]))
                {
                    let newPositionUpdate = new THREE.Vector3(this.getGlobalXPositionFromCoord(this.getXCoordFromGlobalPosition(position.x)),newPosition.y,this.getGlobalZPositionFromCoord(this.getZCoordFromGlobalPosition(position.z)))
                    printOnConsole("Aviso: Não é possível avançar mais por este caminho, seguindo para o próximo comando.")
                    return newPositionUpdate
                }
                else
                {
                    continue
                }
            }
            
            return newPosition
        }
        else
        {
            let newPositionUpdate = new THREE.Vector3(this.getGlobalXPositionFromCoord(this.getXCoordFromGlobalPosition(position.x)),newPosition.y,this.getGlobalZPositionFromCoord(this.getZCoordFromGlobalPosition(position.z)))
            printOnConsole("Aviso: Não é possível avançar mais por este caminho, seguindo para o próximo comando.")
            return newPositionUpdate   
        }
    }

}