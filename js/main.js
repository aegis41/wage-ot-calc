const eInputHours = document.getElementsByClassName("hours-per-week")[0];
const eInputHourly = document.getElementsByClassName("hourly-rate")[0];
const eInputWeekly = document.getElementsByClassName("weekly-rate")[0];
const eValueTotalHours = document.getElementsByClassName("disp-total-hours")[0];
const eValueRegularHours = document.getElementsByClassName("disp-regular-hours")[0];
const eValueOTHours = document.getElementsByClassName("disp-ot-hurs")[0];
const eValueRegularRate = document.getElementsByClassName("disp-regular-rate")[0];
const eValueOTRate = document.getElementsByClassName("disp-ot-rate")[0];
const eValueOnly40Rate = document.getElementsByClassName("disp-only-40-rate")[0];
const eValueWeeklyRate = document.getElementsByClassName("disp-weekly-rate")[0];

function clearDisplay() {
    console.log("Clear");
    eInputHours.value = "";
    eInputHourly.value = "";
    eInputWeekly.value = "";
    eValueTotalHours.innerHTML = "&nbsp;";
    eValueRegularHours.innerHTML = "&nbsp;";
    eValueOTHours.innerHTML = "&nbsp;";
    eValueRegularRate.innerHTML = "&nbsp;";
    eValueOTRate.innerHTML = "&nbsp;";
    eValueOnly40Rate.innerHTML = "&nbsp;";
    eValueWeeklyRate.innerHTML = "&nbsp;";
}

function calculate() {
    updateDisplay(getFactors(getMode()));
};

function updateDisplay(factors) {
    let locale = "en-US";
    let options = { style: 'currency', currency: 'USD' };
    let formatter = new Intl.NumberFormat(locale, options);
    eValueTotalHours.textContent = factors.hours;
    eValueRegularHours.textContent = factors.regHours;
    eValueOTHours.textContent = factors.otHours;
    eValueRegularRate.textContent = formatter.format(factors.hourly);
    eValueOTRate.textContent = formatter.format(factors.otHourly);
    eValueOnly40Rate.textContent = formatter.format(factors.onlyFortyHourly);
    eValueWeeklyRate.textContent = formatter.format(factors.weekly);
};

function getMode() {
    let hasHours = eInputHours.value > 0 && isANumber(eInputHours.value) ? true : false;
    let hasHourly = eInputHourly.value > 0 && isANumber(eInputHourly.value) ? true : false;
    let hasWeekly = eInputWeekly.value > 0 && isANumber(eInputWeekly.value) ? true : false;
    let hasAll = hasHours && hasHourly && hasWeekly;
    let mode = "";

    if (hasHours && hasHourly) {
        // has hours and hourly
        // find weekly
        mode = "calcWeekly"
    } else if (hasHours && hasWeekly) {
        // has hours and weekly
        // find hourly
        mode = "calcHourly"
    } else if (hasHourly && hasWeekly) {
        // has weekly and hourly
        // find hours
        mode = "calcHours"
    } else if (hasAll) {
        // has all
        // just process the display
        mode = "display"
    } else {
        // does not have at least two factors
        // cannot calculate based on the provided values
        mode = "needMoreData"
    }

    return {
        hasHours: hasHours,
        hasHourly: hasHourly,
        hasWeekly: hasWeekly,
        hasAll: hasAll,
        mode: mode,
    }
};

function getFactors(mode) {
    let hoursBD;
    let hourly = mode.hasHourly ? parseFloat(eInputHourly.value) : 0;
    let weekly = mode.hasWeekly ? parseFloat(eInputWeekly.value) : 0;

    if (mode.hasHours) {
        hoursBD = getHourBreakdown(parseFloat(eInputHours.value));
    } else {
        hoursBD = {
            hours: 0,
            regHours: 0,
            otHours: 0
        }
    }

    switch (mode.mode) {
        case "display":
            if ((hoursBD.regHours + (hoursBD.otHours * 1.5)) * hourly === weekly) {
                break;
            } else {
                window.alert("Your values are incorrect. Please try again.")
            }
            break;
        case "calcWeekly":
            weekly = (hoursBD.regHours + (hoursBD.otHours * 1.5)) * hourly;
            break;
        case "calcHourly":
            hourly = weekly / ((hoursBD.otHours * 1.5) + hoursBD.regHours);
            break;
        case "calcHours":
            let totalHours = weekly / hourly;
            hoursBD.regHours = totalHours > 40 ? 40 : totalHours;
            hoursBD.otHours = totalHours > 40 ? numberRoundDecimal((totalHours - 40) / 1.5, 2) : 0;
            hoursBD.hours = hoursBD.regHours + hoursBD.otHours;
            break;
        default:
            console.log("You shouldn't have landed here!!");
    }
    return {
        hours: hoursBD.hours,
        regHours: hoursBD.regHours,
        otHours: hoursBD.otHours,
        hourly: hourly,
        otHourly: hourly * 1.5,
        onlyFortyHourly: numberRoundDecimal(weekly / 40, 2),
        weekly: weekly
    };
};

function getHourBreakdown(hours) {
    let regHours = hours >= 40 ? 40 : hours;
    let otHours = hours > 40 ? hours - 40 : 0;
    return {
        hours: hours,
        regHours: regHours,
        otHours: otHours
    };
};

function isANumber(value) {
    return !isNaN(value);
};

function numberRoundDecimal(v, n) {
    return Math.round((v + Number.EPSILON) * Math.pow(10, n)) / Math.pow(10, n)
}