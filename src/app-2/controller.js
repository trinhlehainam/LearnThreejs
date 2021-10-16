class Controller{
    constructor(){
        this.keys = Array(256).fill(0);
        this.oldKeys = [...this.keys];

        console.log('Controller is constructed !');
        console.log(this.keys);

        document.addEventListener('keydown', this.keydown.bind(this));
        document.addEventListener('keyup', this.keyup.bind(this));
    }

    isPressed(keyCode){
        return this.keys[keyCode] == 1;
    }

    isJustPressed(keyCode){
        return this.keys[keyCode] == 1 && this.oldKeys[keyCode] == 0;
    }

    isRelease(keyCode){
        return this.keys[keyCode] == 0;
    }

    keydown(event){
        this.keys[event.keyCode] = 1;
    }

    keyup(event){
        this.keys[event.keyCode] = 0;
    }

    update(){
        this.oldKeys = [...this.keys];
    }
}

export {Controller};
