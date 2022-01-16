//const apiHost = "https://lightsail.cloudev.guru/hkbus-enquiry-api"
const apiHost = "http://localhost:8080/hkbus-enquiry-api"
const titleEn = "Hong Kong Bus Enquiry"
const titleTc = "香港公共巴士查詢"
const titleSc = "香港公共巴士查询"

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
    document.title = titleEn
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
    document.title = titleTc
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
    document.title = titleSc
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
                enListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${seq}_en" class="routeStop" onclick="showRouteStopEta(event)">${stopDto.nameEn}<a></li>`
                tcListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${seq}_tc" class="routeStop" onclick="showRouteStopEta(event)">${stopDto.nameTc}<a></li>`
                scListHtml += `<li><a href="#" id="${stopDto.company}_${stopDto.stop}_${route}_${direction}_${seq}_sc" class="routeStop" onclick="showRouteStopEta(event)">${stopDto.nameSc}<a></li>`
            }
            document.getElementById("stopsEn").innerHTML = enListHtml
            document.getElementById("stopsTc").innerHTML = tcListHtml
            document.getElementById("stopsSc").innerHTML = scListHtml
        }

    }
    xhttp.open("GET", url);
    xhttp.send();
}

function showRouteStopEta(e) {
    let routeStopId = e.srcElement.id
    let etaParameters = routeStopId.split("_")
    let company = etaParameters[0]
    let stopId = etaParameters[1]
    let route = etaParameters[2]
    let direction = etaParameters[3]
    let seq = etaParameters[4]
    renderRouteStopEta(company, stopId, route, direction, seq)
}

async function renderRouteStopEta(company, stopId, route, direction, seq) {
    removeAllEtaList()
    let routeStopIdEn = `${company}_${stopId}_${route}_${direction}_${seq}_en`
    let routeStopIdTc = `${company}_${stopId}_${route}_${direction}_${seq}_tc`
    let routeStopIdSc = `${company}_${stopId}_${route}_${direction}_${seq}_sc`
    let url = `${apiHost}/route-stop-eta/${company}/${stopId}/${route}/${direction}`
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (this.response) {
            let routeStopEtaDtos = JSON.parse(this.response).result
            let routeStopEtaDtosSorted = routeStopEtaDtos.sort(function (a, b) { return a.minutes - b.minutes })
            let routeStopEtaHtmlEn = `<div class="etaListEn"><ol>`
            let routeStopEtaHtmlTc = `<div class="etaListTc"><ol>`
            let routeStopEtaHtmlSc = `<div class="etaListSc"><ol>`
            for (let routeStopEta of routeStopEtaDtosSorted) {
                if (routeStopEta.minutes == null) {
                    continue;
                }
                let minutesWord = "minutes"
                if (routeStopEta.minutes < 2) {
                    minutesWord = "minute"
                }
                routeStopEtaHtmlEn += `<li>${routeStopEta.minutes}${minutesWord} ${routeStopEta.remarkEn}</li>`
                routeStopEtaHtmlTc += `<li>${routeStopEta.minutes}分鐘 ${routeStopEta.remarkTc}</li>`
                routeStopEtaHtmlSc += `<li>${routeStopEta.minutes}分钟 ${routeStopEta.remarkSc}</li>`
            }
            let checkTime = new Date()
            routeStopEtaHtmlEn += `</ol><p>${getUpdatedTimeEn(checkTime)}</p>`
            routeStopEtaHtmlTc += `</ol><p>${getUpdatedTimeTc(checkTime)}</p>`
            routeStopEtaHtmlSc += `</ol><p>${getUpdatedTimeSc(checkTime)}</p>`
            routeStopEtaHtmlEn += `<button href="#" id="${routeStopIdEn}_b" onclick="showRouteStopEta(event)">Refresh</button></div>`
            routeStopEtaHtmlTc += `<button href="#" id="${routeStopIdTc}_b" onclick="showRouteStopEta(event)">更新</button></div>`
            routeStopEtaHtmlSc += `<button href="#" id="${routeStopIdSc}_b" onclick="showRouteStopEta(event)">更新</button></div>`
            document.getElementById(routeStopIdEn).outerHTML += routeStopEtaHtmlEn
            document.getElementById(routeStopIdTc).outerHTML += routeStopEtaHtmlTc
            document.getElementById(routeStopIdSc).outerHTML += routeStopEtaHtmlSc
        }
    }
    xhttp.open("GET", url);
    xhttp.send();
}

function generateRefreshButton(routeStopId) {
    return `<a href="" onclick=>`
}

function getUpdatedTimeEn(checkTime) {
    let y = checkTime.getFullYear()
    let m = checkTime.getMonth() + 1
    let d = checkTime.getDate()
    let h = checkTime.getHours()
    let n = checkTime.getMinutes()
    let s = checkTime.getSeconds()
    return `Updated at ${y}-${m}-${d} ${h}:${n}:${s}`
}

function getUpdatedTimeTc(checkTime) {
    let y = checkTime.getFullYear()
    let m = checkTime.getMonth() + 1
    let d = checkTime.getDate()
    let h = checkTime.getHours()
    let n = checkTime.getMinutes()
    let s = checkTime.getSeconds()
    return `於${y}年${m}月${d}日${h}:${n}:${s}更新`
}

function getUpdatedTimeSc(checkTime) {
    let y = checkTime.getFullYear()
    let m = checkTime.getMonth() + 1
    let d = checkTime.getDate()
    let h = checkTime.getHours()
    let n = checkTime.getMinutes()
    let s = checkTime.getSeconds()
    return `于${y}年${m}月${d}日${h}:${n}:${s}更新`
}