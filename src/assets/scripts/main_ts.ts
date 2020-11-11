// TODO: site logics
export class Person {
    name: string;
    private age: number;

    constructor(name: string, age: number){
        this.name = name;
        this.age = age;
    }

    sayHi(){
        console.log(`Hi, I am ${this.name}, I am ${this.age} years old now.`)
    }

}