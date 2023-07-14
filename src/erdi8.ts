class Erdi8 {
  private OFFSET = 8 ;
  private UNSAFE: string = "aeiou"

  private alph: string = "23456789abcdefghijkmnopqrstuvwxyz" ;
  private safe: boolean = false;


  public constructor(safe: boolean = false) {
    if (safe) {
        var alph2 = "" ;
	this.alph.split("").forEach( (elem) => {if (! this.UNSAFE.split("").includes(elem)) {alph2 = alph2 + elem}});
	this.alph = alph2;
        this.safe = true;
    }
  }

  public check(input: string):boolean {
  	if (input.length == 0) {
	   return true;
	}
	var flag = true;
	flag = ! this.alph.substring(0, this.OFFSET).split("").includes(input[0]);
	if (! flag) {
		console.error("Error: Not a valid erdi8 string, starts with " + input[0] );	
	}
	for (var i=0; i < input.length; i++) {
		if (! this.alph.split("").includes(input[i])) {
			flag = false;
			console.error("Error: Detected unknown character: " + input[i] + "; allowed are the following: " + this.alph);
		}
	}	
  	return flag;
  }

}

const e8 = new Erdi8(true);
console.log("checking a231: " + e8.check("a92335345345345"));
