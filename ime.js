// ToDo:
// In-Progress. Not working script.
// FYI. Expected input: C + V + V + C || C + V + V || C + V + C || C + V || alt input

// Creates an anonymous function (with namespace 'korean_input') which immediately runs

  var korean_input = (function () {

	// Common variables (which are used across the anonymous function) 
	var input; // Raw info from page
    
	// To be stored in memory across keyInput events
	var convert; // T/F Boolean. Use Korean if true or switchover to Alphanumeric input if false
	
	var hangul; // Hangul object

	// Mapping
	// These are the only keys which will be taken in account
	var mapKeycodeToKey = {
    18:"alt", // Alt = finalise and exit out (and then allow input of normal letters)
    16:"shift", // Shift key = indicate uppercase corresponding characters (but will only work if pressed simultaneously)
    8: "delete", // Delete/Backspace key = indicates previous input should be deleted
    32:" ", // Space = finalise previous as letter if a keystroke exist beforehand (double Space = " ") Note: 1 char!
    81:"q", 87:"w", 69:"e", 82:"r", 84:"t",89:"y",85:"u",73:"i",79:"o",80:"p",
    65:"a", 83:"s", 68:"d", 70:"f", 71:"g", 72:"h",74:"j", 75:"k", 76:"l",
    90:"z", 88:"x", 67:"c", 86:"v", 66:"b", 78:"n", 77:"m"
	}
	
	var mapKeystrokeToJamo = {
    // SimpleType (Applicable to Head/Body/Tail)
    q:"ㅂ",w:"ㅈ", e:"ㄷ",r:"ㄱ",t:"ㅅ",y:"ㅛ",u:"ㅕ",i:"ㅑ",o:"ㅐ",p:"ㅔ", 
    a:"ㅁ",s:"ㄴ",d:"ㅇ",f:"ㄹ", g:"ㅎ", h:"ㅗ",j:"ㅓ", k:"ㅏ", l:"ㅣ",
    z:"ㅋ",x:"ㅌ",c:"ㅊ",v:"ㅍ",b:"ㅠ", n:"ㅜ", m:"ㅡ",
    Q:"ㅃ",W:"ㅉ",E:"ㄸ", R:"ㄲ", T:"ㅆ", O:"ㅒ", P:"ㅖ", 
    // ComplexType (Applicable to Body only)
    hk: "ㅘ ", ho: "ㅙ", hl:"ㅚ ", nj:"ㅝ ", np:"ㅞ ", nl:"ㅟ ", ml:"ㅢ",
    // ComplexType (Applicable to Tail only)
    rt:"ㄳ", sw:"ㄵ", sg:"ㄶ",
    fr:"ㄺ", fa:"ㄻ", fq:"ㄼ", ft:"ㄽ", fx:"ㄾ", fv:"ㄿ", fg:"ㅀ",
    qt:"ㅄ", 
    // Applicable to Head and Tail
    tt:"ㅆ",
    // Special head cases
    qq:"ㅃ",ww:"ㅉ", ee:"ㄸ",rr:"ㄲ"//,tt:"ㅆ"
  };

  // Start Jamo (codepoint & corresponding characters) - 19 lead consonant elements
  var mapKeystrokeToCodepointHead = {
    r:0, //"ㄱ" <-- corresponding Jamo
    R:1, //"ㄲ" 
    s:2, //"ㄴ"
    e:3, //"ㄷ"
    E:4, //"ㄸ"
    f:5, //"ㄹ"
    a:6, //"ㅁ"
    q:7, //"ㅂ"
    Q:8, //"ㅃ"
    t:9, //"ㅅ"
    T:10, //"ㅆ"
    d:11, //"ㅇ"
    w:12, //"ㅈ"
    W:13, //"ㅉ"
    c:14, //"ㅊ"
    z:15, //"ㅋ"
    x:16, //"ㅌ"
    v:17, //"ㅍ"
    g:18, //"ㅎ"
    rr:1, //"ㄲ" 
    ee:4, //"ㄸ"
    qq:8, //"ㅃ"
    ww:13, //"ㅉ"
    tt:10 //"ㅆ"
  };

  // Middle Jamo 
  var mapJamoToCodepointBody = {
    k:0, //"ㅏ" <-- corresponding Jamo
    o:1, //"ㅐ"
    i:2, //"ㅑ"
    O:3, //"ㅒ"
    j:4, //"ㅓ"
    p:5, //"ㅔ"
    u:6, //"ㅕ"
    P:7, //"ㅖ"
    h:8, //"ㅗ"
    hk:9, //"ㅘ"
    ho:10, //"ㅙ"
    hl:11, //"ㅚ"
    y:12, //"ㅛ"
    n:13, //"ㅜ"
    nj:14, //"ㅝ"
    np:15, //"ㅞ"
    nl:16, //"ㅟ"
    b:17, //"ㅠ"
    m:18, //"ㅡ"
    ml:19, //"ㅢ"
    l:20 //"ㅣ"l
  };

  // Final Jamo
  var mapJamoToCodepointTail = {
    _fin:0, // <-- finalise output without tail
    r:1, //"ㄱ" <-- corresponding Jamo
    R:2, //"ㄲ"
    rt:3, //"ㄳ"
    s:4, //"ㄴ"
    sw:5, //"ㄵ"
    sg:6, //"ㄶ"
    e:7, //"ㄷ"
    f:8, //"ㄹ"
    fr:9, //"ㄺ"
    fa:10, //"ㄻ"
    fq:11, //"ㄼ"
    ft:12, //"ㄽ"
    fx:13, //"ㄾ"
    fv:14, // "ㄿ"
    fg:15, //"ㅀ"
    a:16, //"ㅁ"
    q:17, //"ㅂ"
    qt:18, //"ㅄ"
    t:19, //"ㅅ"
    tt:20, //"ㅆ"
    d:21, //"ㅇ"
    w:22, //"ㅈ"
    c:23, //"ㅊ"
    z:24, //"ㅋ"
    x:25, //"ㅌ"
    v:26, //"ㅍ"
    g:27 //"ㅎ"
  }
    
	// Constructors with accessor methods
	// Getters and Setters here i.e. Hangul
	
	// Hangul stores info on the three Jamo characters that make up Hangul with Hangul info
  var Hangul = function(){
   this.jamoHead = undefined; // String
   this.jamoBody = undefined;  // String
   this.jamoTail = undefined;  // String
   this.codepointHead = undefined; // Integer
   this.codepointBody = undefined; // Integer
   this.codepointTail = undefined; // Integer
   this.setJamoHead = function(jamo){
       this.jamoHead = jamo;
   };
   this.setJamoBody = function(jamo){
       this.jamoBody = jamo;
   };
   this.setJamoTail = function(jamo){
       this.jamoTail = jamo;
   };
   this.setCodepointHead = function(codepoint){
       this.codepointHead = codepoint;
   };
   this.setCodepointBody = function(codepoint){
       this.codepointBody = codepoint;
   };
   this.setCodepointTail = function(codepoint){
       this.codepointTail = codepoint;
   };
   this.getJamoHead = function(){
       return this.jamoHead;
   };
   this.getJamoBody = function(){
       return this.jamoBody; 
   };
   this.getJamoTail = function(){
       return this.jamoTail;   
   };
   this.getHangul = function(){
       return String.fromCharCode( (this.codepointHead-1)*588 + (this.codepointBody-1)*28 + this.codepointTail + 44032 );   
   };
   this.unsetJamoHead = function(){
       this.jamoHead = undefined;
       this.codepointHead = undefined;
   };
   this.unsetJamoBody = function(){
       this.jamoBody = undefined;
       this.codepointBody = undefined;
   };
   this.unsetJamoTail = function(){
       this.jamoTail = undefined; 
       this.codepointTail = undefined;
   };
   this.resetHangul = function(){
       this.jamoHead = undefined;
       this.jamoBody = undefined;
       this.jamoTail = undefined;
       this.codepointHead = undefined;
       this.codepointBody = undefined;
       this.codepointTail = undefined;
   };
  };

  // Set new Objects to public variable names

	// Make empty (by default) public Hangul object (for accessing to use in below)
	hangul = new Hangul();

	// Main starter function which takes 'id' parameter as obtained from the HTML document
	function init(id){
	        // Set the variables to default values
	        // Define conversion to be true (switch Korean input on) by default (at the start)
	        convert = (typeof convert === 'undefined') ? true : true;
	        // Get the input area information
	        input = document.getElementById(id); // Gets the textarea by the 'id' name given
	        // Start checking each key entry into the input area (based on 'keydown' events)
	        input.addEventListener("keydown", filterKey, false); // Calls 'filterKey' function
	        // Console logging notes for testing
	        console.log("#info#: initialising"); 
        
	}

	// Check if the keyboard event (key selection) is allowed if in Korean mode
	function filterKey(event){
        
        // Internal variables (which will not be stored past the point of event)
        var keyInput; // Current keyed-in input character from the user
        var keyStoke; // Combination of keyStrokes up to 2 digits (if history exists)
        var keyOutput; // The return string (displayed output on-screen)
        
        var keyAllow; // T or F
        
        // ToDo:
        // .....
        
       // Cross browser event definition check
        event = event|| window.event;
 
        // Sets the key's string value, else finalise the previous input (if any) and ignore the current input
        keyInput = event.keyCode in mapKeycodeToKey ? mapKeycodeToKey[event.keyCode] : "invalid"; 
        
		if (convert == true && keyInput == "invalid"){// Input was invalid and not expected
		//Cancel the keypress event (forbids entry of non-mapped keyInput keys when in Korean mode)
		event.preventDefault(); 
		}
		else{// Input is allowed (for now)
			// ToDo:
			//...
		}
        
	}
	

})();
