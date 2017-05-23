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
 
AJAX_JSON_Req('data/build.json');

function cheatBuilding(){
	jQuery.each(buildingControl, function(id, building) {
		if (building.hasOwnProperty("researchLevel")){
			buildingControl[id].researchLevel = 1;
			buildingControl[id].amount = 1;
		}
	});
	jQuery.each(buildingControl.storage.type, function(id, storage) {
		if (storage.hasOwnProperty("researchLevel")){
			buildingControl.storage.type[id].researchLevel = 1;
			buildingControl.storage.type[id].amount = 1;
		}
	}); 
	displayPrime();
	displayResources();
}

function displayJobs(){
	var displayText = '<h1 class="titleCenter">Worker Managment</h1>';
	var currentWorkers = 0;
	var buildingCount = 0;
	




	displayText += "<div class=\"container-fluid\">";
		displayText += "<div class=\"row is-table-row\">";
			displayText += "<div class=\"col-md-4\">";
	jQuery.each(buildingControl, function(bi, building) {
		if (building.hasOwnProperty("jobs") && building.researchLevel != 0) {
				displayText += "<div class=\"container-fluid\">";
					displayText += "<div class=\"row is-table-row\">";
						displayText += "<div class=\"col-md-2 addRemoveButtons\">";
							displayText += "<a onClick=\"modifyBuilding(\'" + bi + "\',-" + amountModify + ");\">-</a> ";
							displayText += "<a onClick=\"modifyBuilding(\'" + bi + "\'," + amountModify + ");\">+</a>";
						displayText += "</div>";
						displayText += "<div class=\"col-md-10 buildingHeader\">";
							displayText += building.name;
							displayText += "(" + building.amount + ")";
						displayText += "</div>";	
					displayText += "</div>";		
			jQuery.each(building.jobs, function(wi, workers) {
					displayText += "<div class=\"row is-table-row\">";
						displayText += "<div class=\"col-md-2 addRemoveButtons\">";
							displayText += "<a onClick=\"modifyWorker(\'" + wi + "\'," + amountModify + ");\">-</a> ";
							displayText += "<a onClick=\"modifyWorker(\'" + wi + "\'," + amountModify + ");\">+</a>";
						displayText += "</div>";
						displayText += "<div class=\"col-md-10\">";
							displayText += workers.name + "(";
							displayText += workers.amount + ")";
						displayText += "</div>";	
					displayText += "</div>";
				displayText += "</div>";						
			});
			displayText += "</div>";
			buildingCount += 1;
			if (buildingCount == 3){
		displayText += "</div>";
		displayText += "<div class=\"row is-table-row\">"
			displayText += "<div class=\"col-md-4\">"
					buildingCount = 0;				
			} else {
			displayText += "<div class=\"col-md-4\">";	
			}
		}
	});
	switch(buildingCount){
		case 1:
			displayText += "<div class=\"col-md-8\">";
			displayText += "</div>";
		displayText += "</div>";
		break;
		case 2:
			displayText += "<div class=\"col-md-8\">";
			displayText += "</div>";
		displayText += "</div>";
		break;
	}
	displayText += "</div>";		

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

/* modifyWorker() - TODO:

	population controls need to be put in place, after this 
	modifyWorker needs to change the population total and not add workers when
	no population is actually present.



*/
function modifyWorker(worker, toChange){
	var buildingKey = ""; //holds the building index for later modfcation
	var totalWorkers = 0; //used if there is more then one worker keyed to a building.
	
	jQuery.each(buildingControl, function(bi, building) {  //steps through each building in the buildingControl Object

		if (building.hasOwnProperty("jobs")) { 				//tests to see if the current building has any jobs keyed to it.
			if(building.jobs.hasOwnProperty(worker)){		//tests to see if the any of the jobs for that building are the worker we are looking for
				if (Object.keys(building).length > 1){		//tests to see if the building shares its space among more then one worker type.
					jQuery.each(building.jobs, function(x, sharedJobs){ //if the building has more then one job it pull steps through each one of them adding it to total jobs of the building
						totalWorkers += sharedJobs.amount;
					});
				} else {
					totalWorkers = building.jobs[worker].amount; //if one job just grabs that jobs total workers.
				}					
				buildingKey = bi; 									//stores the index of the building that we want to add or remove the worker from
				return false; // building was found so no need to keep the loop goinging.
			}
		}
	});
	
	
	//checks lower and upper limits and modifys toChange accordingly
	
	if (buildingControl[buildingKey].supportedPop < (totalWorkers + toChange)){
		toChange = buildingControl[buildingKey].supportedPop - totalWorkers;
	} else if ((totalWorkers + toChange) < 0){
		toChange = 0 - buildingControl[buildingKey].jobs[worker].amount;
	};
	
	
	
	buildingControl[buildingKey].jobs[worker].amount += toChange;  //modifys amount vaulue
	displayPrime();  //repopulates the primesection of the webcode and redraws it.
	
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

	jQuery.each(buildingControl.storage.type, function(si, storageBuilding) {
		if (storageBuilding.researchLevel !=0){
			var workerStorage = storageBuilding.worker;
			var workers = workerStorage.split('^');
			if (workers.length > 1) {
				for (x = 0; x < workers.length - 1; x++){
					jQuery.each(buildingControl, function(ji, jobSearch){
						if (jobSearch.hasOwnProperty("jobs")){
							if (jobSearch.jobs.hasOwnProperty(workers[x])){
								var totalResourceAdd = buildingControl[ji].jobs[workers[x]].amount * buildingControl[ji].jobs[workers[x]].perCycle;
								if (buildingControl.storage.type[si].currentStorage + totalResourceAdd > buildingControl.storage.type[si].maxStorage){
									buildingControl.storage.type[si].currentStorage = buildingControl.storage.type[si].maxStorage;
								}else{
									buildingControl.storage.type[si].currentStorage += totalResourceAdd;
								}
								
								return false;
							}
						}
					});
				} 
			} else {
				jQuery.each(buildingControl, function(ji, jobSearch){
					if (jobSearch.hasOwnProperty("jobs")){
						if (jobSearch.jobs.hasOwnProperty(workers)){
							var totalResourceAdd = buildingControl[ji].jobs[workers].amount * buildingControl[ji].jobs[workers].perCycle;
							if (buildingControl.storage.type[si].currentStorage + totalResourceAdd > buildingControl.storage.type[si].maxStorage){
								buildingControl.storage.type[si].currentStorage = buildingControl.storage.type[si].maxStorage;
							}else{
								buildingControl.storage.type[si].currentStorage += totalResourceAdd;
							}							
								return false;
						}
					}
				});
			}
		}
	});
}
