import {IComponent} from './IComponent.js'
import {Vector3} from '../../../lib/three/three.js'

class TransformComponent extends IComponent {
    constructor(){
        super();
        this.position = new Vector3(); 
        this.scale = new Vector3(1,1,1);
    }

    setPos(x, y, z){
        this.position = Vector3(x, y, z);
    }

    setScale(x, y, z){
        this.scale = Vector3(x, y, z);
    }

    name(){
        return 'TransformComponent';
    }
}

export {TransformComponent};
