const apiHost = "https://lightsail.cloudev.guru/hkbus-enquiry-api"
let sysLang = ""

function setLanguageEn() {
    for (let pageEnElement of document.getElementsByClassName("en_item")) {
        pageEnElement.style.display = ""
    }
    for (let pageTcElement of document.getElementsByClassName("tc_item")) {
        pageTcElement.style.display = "none"
    }
    for (let pageTcElement of document.getElementsByClassName("sc_item")) {
        pageTcElement.style.display = "none"
    }
    sysLang = "en"
}

function setLanguageTc() {
    for (let pageEnElement of document.getElementsByClassName("tc_item")) {
        pageEnElement.style.display = ""
    }
    for (let pageTcElement of document.getElementsByClassName("en_item")) {
        pageTcElement.style.display = "none"
    }
    for (let pageTcElement of document.getElementsByClassName("sc_item")) {
        pageTcElement.style.display = "none"
    }
    sysLang = "tc"
}

function setLanguageSc() {
    for (let pageEnElement of document.getElementsByClassName("sc_item")) {
        pageEnElement.style.display = ""
    }
    for (let pageTcElement of document.getElementsByClassName("en_item")) {
        pageTcElement.style.display = "none"
    }
    for (let pageTcElement of document.getElementsByClassName("tc_item")) {
        pageTcElement.style.display = "none"
    }
    sysLang = "sc"
}

function cleanTable() {
    document.getElementById("stopsEn").innerHTML = ""
    document.getElementById("stopsTc").innerHTML = ""
    document.getElementById("stopsSc").innerHTML = ""
    document.getElementById("directionEn").innerHTML = ""
    document.getElementById("directionTc").innerHTML = ""
    document.getElementById("directionSc").innerHTML = ""
    removeAllEtaList()
}

function removeAllEtaList() {
    for (let etaListEn of document.getElementsByClassName("etaListEn")) {
        etaListEn.remove()
    }
    for (let etaListTc of document.getElementsByClassName("etaListTc")) {
        etaListTc.remove()
    }
    for (let etaListSc of document.getElementsByClassName("etaListSc")) {
        etaListSc.remove()
    }
}

function getCompanyValue() {
    if (sysLang == "en") {
        return document.getElementById("companyEn").value;
    } else if (sysLang == "sc") {
        return document.getElementById("companySc").value;
    } else {
        return document.getElementById("companyTc").value;
    }
}

function getDirectionValue() {
    if (sysLang == "en") {
        return document.getElementById("directionEn").value;
    } else if (sysLang == "sc") {
        return document.getElementById("directionSc").value;
    } else {
        return document.getElementById("directionTc").value;
    }
}

function showRoute() {
    cleanTable()
    let route = document.getElementById("route").value;
    let company = getCompanyValue();
    if (route != null && route != "") {
        getRouteByCompanyAndRoute(company, route)
        renderRouteDetail(company, route, "outbound")
    }
}

function showRouteDetail() {
    document.getElementById("stopsEn").innerHTML = ""
    document.getElementById("stopsTc").innerHTML = ""
    document.getElementById("stopsSc").innerHTML = ""
    let route = document.getElementById("route").value;
    let company = getCompanyValue();
    let direction = getDirectionValue()
    renderRouteDetail(company, route, direction)
}

async function getRouteByCompanyAndRoute(company, route) {
    removeAllEtaList()
    let url = `${apiHost}/route/${company.trim()}/${route.trim()}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            routeJson = JSON.parse(this.response)
            let enOutboundOptionHtml
            let enInboundOptionHtml
            let tcOutboundOptionHtml
            let tcInboundOptionHtml
            let scOutboundOptionHtml
            let scInboundOptionHtml
            for (let i = 0; i < routeJson.result.length; i++) {
                let routeInfo = routeJson.result[i]
                if (routeInfo.bound.toLowerCase() == "o") {
                    enOutboundOptionHtml = `<option value="${routeInfo.bound}">${routeInfo.originEn}->${routeInfo.destinationEn}</option>`
                    tcOutboundOptionHtml = `<option value="${routeInfo.bound}">${routeInfo.originTc}->${routeInfo.destinationTc}</option>`
                    scOutboundOptionHtml = `<option value="${routeInfo.bound}">${routeInfo.originSc}->${routeInfo.destinationSc}</option>`
                } else {
                    enInboundOptionHtml = `<option value="${routeInfo.bound}">${routeInfo.originEn}->${routeInfo.destinationEn}</option>`
                    tcInboundOptionHtml = `<option value="${routeInfo.bound}">${routeInfo.originTc}->${routeInfo.destinationTc}</option>`
                    scInboundOptionHtml = `<option value="${routeInfo.bound}">${routeInfo.originSc}->${routeInfo.destinationSc}</option>`
                }
            }
            document.getElementById("directionEn").innerHTML = `${enOutboundOptionHtml}${enInboundOptionHtml}`
            document.getElementById("directionTc").innerHTML = `${tcOutboundOptionHtml}${tcInboundOptionHtml}`
            document.getElementById("directionSc").innerHTML = `${scOutboundOptionHtml}${scInboundOptionHtml}`
        }
    }
    xhttp.open("GET", url);
    xhttp.send();
}

async function renderRouteDetail(company, route, direction) {
    removeAllEtaList()
    let url = `${apiHost}/route-detail/${company}/${route}/${direction}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            routeDetailJson = JSON.parse(this.response)
            let stopDetailDtos = routeDetailJson.result.stopDetailDtos
            let stopDetailDtosSorted = stopDetailDtos.sort(function (a, b) { return a.seq - b.seq });
            let enListHtml = "";
            let tcListHtml = "";
            let scListHtml = "";
            for (let i = 0; i < stopDetailDtosSorted.length; i++) {
                let stopDto = stopDetailDtosSorted[i].stopDto
                let seq = stopDetailDtosSorted[i].seq
                enListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${seq}_en" class="routeStop" onclick="renderEta(event)">${stopDto.nameEn}<a></li>`
                tcListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${seq}_tc" class="routeStop" onclick="renderEta(event)">${stopDto.nameTc}<a></li>`
                scListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${seq}_sc" class="routeStop" onclick="renderEta(event)">${stopDto.nameSc}<a></li>`
            }
            document.getElementById("stopsEn").innerHTML = enListHtml
            document.getElementById("stopsTc").innerHTML = tcListHtml
            document.getElementById("stopsSc").innerHTML = scListHtml
        }

    }
    xhttp.open("GET", url);
    xhttp.send();
}

async function renderEta(e) {
    removeAllEtaList()
    let routeStopId = e.srcElement.id
    let etaParameters = routeStopId.split("_")
    let company = etaParameters[0]
    let stopId = etaParameters[1]
    let route = etaParameters[2]
    let direction = etaParameters[3]
    let seq = etaParameters[4]
    let routeStopIdEn = `${company}_${stopId}_${route}_${direction}_${seq}_en`
    let routeStopIdTc = `${company}_${stopId}_${route}_${direction}_${seq}_tc`
    let routeStopIdSc = `${company}_${stopId}_${route}_${direction}_${seq}_sc`
    let url = `${apiHost}/route-stop-eta/${company}/${stopId}/${route}/${direction}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            let routeStopEtaDtos = JSON.parse(this.response).routeStopEtaDtos
            let routeStopEtaDtosSorted = routeStopEtaDtos.sort(function (a, b) { return a.minutes - b.minutes })
            let routeStopEtaHtmlEn = `<ol class="etaListEn">`
            let routeStopEtaHtmlTc = `<ol class="etaListTc">`
            let routeStopEtaHtmlSc = `<ol class="etaListSc">`
            for (let routeStopEta of routeStopEtaDtosSorted) {
                let minutesWord = "minutes"
                if (routeStopEta.minutes < 2) {
                    minutesWord = "minute"
                }
                routeStopEtaHtmlEn += `<li>${routeStopEta.minutes}${minutesWord} ${routeStopEta.remarkEn}</li>`
                routeStopEtaHtmlTc += `<li>${routeStopEta.minutes}分鐘 ${routeStopEta.remarkTc}</li>`
                routeStopEtaHtmlSc += `<li>${routeStopEta.minutes}分钟 ${routeStopEta.remarkSc}</li>`
            }
            routeStopEtaHtmlEn += "</ol>"
            routeStopEtaHtmlTc += "</ol>"
            routeStopEtaHtmlSc += "</ol>"
            document.getElementById(routeStopIdEn).outerHTML += routeStopEtaHtmlEn
            document.getElementById(routeStopIdTc).outerHTML += routeStopEtaHtmlTc
            document.getElementById(routeStopIdSc).outerHTML += routeStopEtaHtmlSc
        }
    }
    xhttp.open("GET", url);
    xhttp.send();
}
