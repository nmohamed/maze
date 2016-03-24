console.log("hello world");
console.log(document.body.children[1].innerHTML);


function returnStep (event) {
	event.preventDefault();

	var self = this;
	var id = '';
	var x;
	var y;
	var maze;



	$.post("nextstep", {
		id: id,
		letter: letterOfStep,
		adjacent: adjacentSteps,
		end: isEnd
	})
		.done(function (data, status) {
			console.log('Post successful');
		})
		.error(onError);
};

var getEncode = function(){
	return [['a', 'b', 'c', 'd', 'e'], 
			['f', 'g', 'h', 'i', 'j'], 
			['k', 'l', 'm', 'n', 'o'], 
			['p', 'q', 'r', 's', 't'], 
			['u', 'v', 'w', 'x', 'y']];
}

var onError = function(data, status) {
  console.log("Status", status);
  console.log("Error", data);
};