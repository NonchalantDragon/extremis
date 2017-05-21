var maxPop = 10;
var land = 100;
var epoch = 1;
var buildingControl;
var researchBoost = 1;
var activePage = "default";
var primaryLoop = setInterval(gameLoop, 1000);
var addAmount = 1;

function AJAX_JSON_Req( url ) {
    var AJAX_req = new XMLHttpRequest();
    AJAX_req.open( "GET", url, true );
    AJAX_req.setRequestHeader("Content-type", "application/json");
 
    AJAX_req.onreadystatechange = function()
    {
        if( AJAX_req.readyState == 4 && AJAX_req.status == 200 )
        {
			buildingControl = JSON.parse( AJAX_req.responseText );
        }
    }
    AJAX_req.send();
}
 
AJAX_JSON_Req( 'data/build.json' );

function displayJobs(){
	var displayText = '<h1 class="titleCenter">JOBS!</h1>';
	jQuery.each(buildingControl, function(i, building) {
		if (building.hasOwnProperty("jobs") && building.researchLevel != 0) {
			displayText += "<h2>" + building.name + " </h2> can support " + (building.supportedPop * building.amount) + " worker(s).<br><b>Workers:</b><br>";
			jQuery.each(building.jobs, function(x, workers) {
				
				displayText += "----------" + workers.name + " : " + workers.amount;
				displayText += "<a onClick=\"addWorker(\'" + workers.id + "\'," + addAmount + ");\" style=\"cursor: pointer; cursor: hand;\"><b>Add Worker</b></a> <a><b>Remove Worker</b></a><br>";

			});
			displayText += "</p>"
			console.log(displayText);
		}
	});

	document.getElementById('prime').innerHTML = displayText;


}

function displayMain(){
	var displayText = "";
	document.getElementById('prime').innerHTML = displayText;
}

function displayPrime(){
	switch (activePage) {
		case "jobs":
			displayJobs();
			break;
		default:
			displayMain();
			break;
	}
}
		
function displayResources() {
	var displayText = "";
	jQuery.each(buildingControl.storage.type, function(i, building) {
		if (building.researchLevel != 0) {
			if (building.currentStorage < building.maxStorage){
				displayText += "<li>";
			} else {
				displayText += "<li class=\"resourceFull\">";
			}
			displayText += building.name + ": " + building.currentStorage + "/" + building.maxStorage + "</li>";
		}
	});
	document.getElementById('resources').innerHTML = displayText;

}

function menuClick(pageActivation){
	activePage = pageActivation;
	displayPrime();
}

function addWorker(worker, toAdd){
	var buildingKey = "";
	var availPop = 0;
	var totalWorkers = 0;
	
	jQuery.each(buildingControl, function(i, building) {

		if (building.hasOwnProperty("jobs")) {
			if(building["jobs"].hasOwnProperty(worker)){
				if (Object.keys(building).length > 1){
					jQuery.each(building["jobs"], function(x, sharedJobs){
						totalWorkers += sharedJobs["amount"];
					});
				} else totalWorkers = building["jobs"][worker]["amount"];
				buildingKey = building["id"];
				return false;
			}
		}
	});
	
	if (buildingControl[buildingKey]["supportedPop"] < (totalWorkers + toAdd))
		toAdd = buildingControl[buildingKey]["supportedPop"] - totalWorkers;
	
	buildingControl[buildingKey]["jobs"][worker]["amount"] += toAdd;
	displayPrime();
	
}

function test(){
	addWorker("forester", 3);
	addWorker("hunter", 8);
	
	
	var stringBuilder = "";
	
	jQuery.each(buildingControl, function(i, building) {
		stringBuilder += building.name + " : Total(" + building.amount + ") : Research Level(" + building.researchLevel + ") : Supported Population(" + building.supportedPop + ")<br>";
		if (building.hasOwnProperty("jobs")){ 
			stringBuilder += "JOBS:" + "<br>";
			jQuery.each(building.jobs, function(x, job) {
				stringBuilder += "-----" + job.name + " : Workers(" + job.amount + ") : Descrption(" + job.description + ")" + "<br>";
			});
		}
	});
	document.getElementById('testground').innerHTML = stringBuilder;
			
};

function gameLoop() {
	displayResources();

	jQuery.each(buildingControl.storage.type, function(i, storageBuilding) {
		if (storageBuilding.researchLevel !=0){
			var workerStorage = storageBuilding.worker;
			var workers = workerStorage.split('^');
			if (workers.length > 1) {
				for (x = 0; x < workers.length - 1; x++){
					jQuery.each(buildingControl, function(y, jobSearch){
						if (jobSearch.hasOwnProperty("jobs")){
							if (jobSearch.jobs.hasOwnProperty(workers[x])){
								buildingControl.storage.type[storageBuilding.id].currentStorage += (buildingControl[jobSearch.id].jobs[workers[x]].amount * buildingControl[jobSearch.id].jobs[workers[x]].perCycle);
								return false;
							}
						}
					});
				} 
			} else {
				jQuery.each(buildingControl, function(y, jobSearch){
					if (jobSearch.hasOwnProperty("jobs")){
						if (jobSearch.jobs.hasOwnProperty(workers)){
							buildingControl.storage.type[storageBuilding.id].currentStorage += (buildingControl[jobSearch.id].jobs[workers].amount * buildingControl[jobSearch.id].jobs[workers].perCycle);
							return false;
						}
					}
				});
			}
		}
	});
}
