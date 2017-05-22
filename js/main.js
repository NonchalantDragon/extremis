var maxPop = 10;
var land = 100;
var epoch = 1;
var buildingControl;
var researchBoost = 1;
var activePage = "default";
var primaryLoop = setInterval(gameLoop, 1000);
var amountModify = 1;

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

function cheatBuiling(){
	jQuery.each(buildingControl, function(i, building) {
		if (building.hasOwnProperty("researchLevel")){
			buildingControl[building.id].researchLevel = 1;
			buildingControl[building.id].amount = 1;
		}
	});
	jQuery.each(buildingControl.storage.type, function(i, storage) {
		if (storage.hasOwnProperty("researchLevel")){
			buildingControl.storage.type[storage.id].researchLevel = 1;
			buildingControl.storage.type[storage.id].amount = 1;
		}
	});
	displayPrime();
	displayResources();
}

function displayJobs(){
	var displayText = '<h1 class="titleCenter">Building Managment</h1>';
	var currentWorkers = 0;
	jQuery.each(buildingControl, function(i, building) {
		if (building.hasOwnProperty("jobs") && building.researchLevel != 0) {
			
			displayText += "<div class=\"container-fluid\">";
			displayText += "<div class=\"row is-table-row\">";
			displayText += "<div class=\"col-md-3\"><span class=\"buildingHeader\">";
			displayText += building.name + "</span>: " + building.amount;
			displayText += "</div>";
			displayText += "<div class=\"col-md-1 addRemoveButtons\">";
			displayText += "<a onClick=\"removeBuilding(\'" + building.id + "\'," + amountModify + ");\">-</a> ";
			displayText += "<a onClick=\"addBuilding(\'" + building.id + "\'," + amountModify + ");\">+</a>";
			displayText += "</div>";
			displayText += "<div class=\"col-md-8\">";
			displayText += "</div>";
			displayText += "</div>";
			displayText += "</div>";
			displayText += building.description + "<br>";
			
			
			
			
			
			
			displayText += "<div class=\"container-fluid\">";
			jQuery.each(building.jobs, function(x, workers){
				currentWorkers += workers.amount;
			});
			displayText += "This building is at a research level of <b>" + building.researchLevel + "</br> and has ";
//			if (((building.supportedPop * building.amount) > currentWorkers) && (building.amount > 1) && )currentWorkers != 1)){
//				displayText += 
//			}else if (((building.supportedPop * building.amount) > currentWorkers
			displayText += "";
			jQuery.each(building.jobs, function(x, workers) {
				displayText += "<div class=\"row is-table-row\">";
				displayText += "<div class=\"col-md-1 addRemoveButtons\">";
				displayText += "<a onClick=\"removeWorker(\'" + workers.id + "\'," + amountModify + ");\">-</a> ";
				displayText += "<a onClick=\"addWorker(\'" + workers.id + "\'," + amountModify + ");\">+</a>";
				displayText += "</div>";
				displayText += "<div class=\"col-md-3\">";
				displayText += workers.name + " : " + workers.amount;
				displayText += "</div>";
				displayText += "<div class=\"col-md-8\">";
				displayText += "</div>";
				displayText += "</div>";
			});
			
			displayText += "</div>";
			
			
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
								var totalResourceAdd = buildingControl[jobSearch.id].jobs[workers[x]].amount * buildingControl[jobSearch.id].jobs[workers[x]].perCycle;
								if (buildingControl.storage.type[storageBuilding.id].currentStorage + totalResourceAdd > buildingControl.storage.type[storageBuilding.id].maxStorage){
									buildingControl.storage.type[storageBuilding.id].currentStorage = buildingControl.storage.type[storageBuilding.id].maxStorage;
								}else{
									buildingControl.storage.type[storageBuilding.id].currentStorage += totalResourceAdd;
								}
								
								return false;
							}
						}
					});
				} 
			} else {
				jQuery.each(buildingControl, function(y, jobSearch){
					if (jobSearch.hasOwnProperty("jobs")){
						if (jobSearch.jobs.hasOwnProperty(workers)){
							var totalResourceAdd = buildingControl[jobSearch.id].jobs[workers].amount * buildingControl[jobSearch.id].jobs[workers].perCycle;
							if (buildingControl.storage.type[storageBuilding.id].currentStorage + totalResourceAdd > buildingControl.storage.type[storageBuilding.id].maxStorage){
								buildingControl.storage.type[storageBuilding.id].currentStorage = buildingControl.storage.type[storageBuilding.id].maxStorage;
							}else{
								buildingControl.storage.type[storageBuilding.id].currentStorage += totalResourceAdd;
							}							
								return false;
						}
					}
				});
			}
		}
	});
}
