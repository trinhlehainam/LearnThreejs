import {IComponent} from "../Component/IComponent.js"

class IEntity{
    constructor(tag){
        this.components = {};
        // this.entityMng = entityMng;
        this.tag = tag;
        this.isActive = true;
    }

    getTag(){
        return this.tag;
    }

    addComponent(component){
        if(!(component instanceof IComponent)){
            alert("ERROR: " + component + " is not component!!!");
            return;
        }
        if(this.components.hasOwnProperty(component.name())){
            alert("WARN: " + component + " in" + this.tag + " is exist !!!");
            return;
        }
        this.components[component.name()] = component;
    }
    
    // Component's Name is same name of its class
    hasComponent(componentName){
       return this.components.hasOwnProperty(componentName); 
    }

    // Component's Name is same name of its class
    getComponent(componentName){
        if(this.hasComponent(componentName)){
            return this.components[componentName];
        }
        return undefined;
    }

    update(delta){
       Object.keys(this.components).forEach(function(key) {
           this.components[key].update(delta);
       }) 
    }

    render() {
       Object.keys(this.components).forEach(function(key) {
           this.components[key].render();
       }) 
    }
}

export {IEntity};
