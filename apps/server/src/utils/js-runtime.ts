class Task<F extends ()=>void>{
    private constructor(){}
    static create<Fn>(func:Fn): Task<Fn> {
        return new Task<F>();
    }
    cancel
}