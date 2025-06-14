function addGithubLink() {
    var filename = window.location.pathname.split("/").slice(-1)[0];
    filename = filename || "index.html";
    var menu =
    '<a href="#" id=drawerToggle class="material-icons">menu</a>'+
    '<img alt="GeoGebra" src="logo.svg" class="headerLogo" draggable="false">'+
    '<h1 class="siteName">Integration Examples</h1>'+
    '<div id=githubLink class="githubLink"><a target="_blank" href="https://github.com/geogebra/integration/blob/master/'+filename+'">View on GitHub</a></span>';
    var menuDiv = document.createElement('div');
    menuDiv.className = "sample-toolbar";
    menuDiv.innerHTML = menu;
    document.body.insertBefore(menuDiv,document.body.children[0]);
}

function addDrawer(){
    var filename = window.location.pathname.split("/").slice(-1)[0];
    var menu =
    '<h4>Interactive Visualizations</h4>'+
    '<ul><li> <a href="index.html">Dynamic Resources</a></li>'+
    '<li> <a href="basic-dynamic-3d-resources.html">Dynamic 3D Resources</a></li>'+
    '<li> <a href="plus-dynamic-resources.html">Dynamic Calculators</a></li></ul>'+
        
    '<h4>Calculators</h4>'+
    '<ul><li> <a href="example-graphing.html">Apps Integration</a></li>'+
    '<li> <a href="example-popup.html">Apps in Popups</a></li>'+
    '<li> <a href="example-customized-calculators.html">Customized Apps</a></li></ul>'+
    '<h4> Integrations (API)</h4>'+
    '<ul><li> <a href="example-api-save-state.html">Saving & Loading</a></li>'+
    '<li> <a href="example-api.html">Buttons & Inputs</a></li>'+
    '<li> <a href="example-api-listeners.html">Event Listeners</a></li>'+
    '<li> <a href="example-api-sync.html">Communication between Resources</a></li>'+
    '<li> <a href="example-assess.html">Environment Integration</a></li></ul>'+
    '<h4>Documentation</h4>'+
    '<ul><li> <a href="basic-embedding-options.html">Embedding Options</a></li>'+
    '<li><a href="https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/" target="_blank">Math Apps Embedding&nbsp;&nbsp;<span class="material-icons inline">arrow_downward</span></a></li>'+
    '<li><a href="https://geogebra.github.io/docs/reference/en/GeoGebra_App_Parameters/" target="_blank">App Parameters&nbsp;&nbsp;<span class="material-icons inline">arrow_downward</span></a></li>'+
    '<li><a href="https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/" target="_blank">GeoGebra Apps API&nbsp;&nbsp;<span class="material-icons inline">arrow_downward</span></a></li>'+
    '<li><a href="https://geogebra.github.io/docs/reference/en/Material_Embedding_(Iframe)/" target="_blank">Iframe Embedding&nbsp;&nbsp;<span class="material-icons inline">arrow_downward</span></a></li>';

    var menuDiv = document.createElement('div');
    menuDiv.id="drawer";
    menuDiv.innerHTML = menu;
    if(window.innerWidth > 800){
        menuDiv.style.display="block";
        document.getElementById("contentBox").classList.add('right');
    }
    document.body.insertBefore(menuDiv,document.body.children[1]);

    document.getElementById("drawerToggle").addEventListener("click",function(){
        var visible = menuDiv.style.display == "block";
        console.log(visible);
        if(!visible){
            menuDiv.style.display = "block";
            document.getElementById("contentBox").classList.add('right');
            
        } else {
            menuDiv.className = "animateOut";
            var callback = function(){
                menuDiv.removeEventListener("animationend",callback);
                menuDiv.style.display = "none";
                menuDiv.className = "";
            }
            document.getElementById("contentBox").classList.remove('right');
            menuDiv.addEventListener("animationend",callback);
        }
    });
}

function loadNav(){
    insertHeaderLink("https://fonts.googleapis.com/icon?family=Material+Icons","text/css","stylesheet" );
    
    if (window.location.search.match(/frameless/)) {
        document.getElementById("contentBox").classList.add('contentBoxSmall');
    } else {
        addGithubLink();
        addDrawer();
    }
}

function insertHeaderLink(url, type, rel){
    var styleEl = document.createElement('link');
    styleEl.setAttribute("href",url);
    styleEl.setAttribute("type",type);
    styleEl.setAttribute("rel",rel);
    document.getElementsByTagName("head")[0].appendChild(styleEl);
}

insertHeaderLink("navigation.css","text/css","stylesheet" );
insertHeaderLink("https://www.geogebra.org/apps/icons/geogebra.ico","image/x-icon","shortcut icon" );
insertHeaderLink("https://www.geogebra.org/apps/icons/geogebra.ico","image/x-icon","icon" );

if (window.addEventListener) {
    window.addEventListener('load', loadNav, false);
} 