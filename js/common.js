function getURLVar(urlVarName) {

    var urlToParse = document.location;

    if (String(document.location).indexOf("#") > -1)
    {
        urlToParse = String(urlToParse).substr(0, String(urlToParse).indexOf("#"));
    }

    var urlHalves = String(urlToParse).split('?');

    var urlVarValue = '';

    if(urlHalves[1])
        {
            var urlVars = urlHalves[1].split('&');
            for(i=0; i<=(urlVars.length); i++)
            {
                if(urlVars[i])
                {
                    var urlVarPair = urlVars[i].split('=');
                    if (urlVarPair[0] && urlVarPair[0] == urlVarName)
                    {
                        urlVarValue = urlVarPair[1];
                    }
                }
            }
        }

    return urlVarValue;
}

function getHost() {
    return document.location.hostname;
}

function getPort() {
    var urlHost = String(document.location.host).split(':');
    var urlPort = '80';

    if(urlHost[1])
        urlPort = urlHost[1];

    return urlPort;
}
