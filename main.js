/*
<!--
    ########################################
    ## @author Benjamin Thomas Schwertfeger (October 2021)
    ## copyright by Benjamin Thomas Schwertfeger (October 2021)
    ############ 
-->
*/

const {
    complex,
    sqrt,
    multiply,
    add
} = require("mathjs");

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 

function arange(start, end, step) {
    let range = [],
        typeofStart = typeof start,
        typeofEnd = typeof end;

    if (step === 0) {
        throw TypeError("Step cannot be zero.");
    }

    if (typeofStart == "undefined" || typeofEnd == "undefined") {
        throw TypeError("Must pass start and end arguments.");
    } else if (typeofStart != typeofEnd) {
        throw TypeError("Start and end arguments must be of same type.");
    }
    typeof step == "undefined" && (step = 1);

    if (end < start) {
        step = -step;
    }
    if (typeofStart == "number") {
        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }
    } else if (typeofStart == "string") {
        if (start.length != 1 || end.length != 1) {
            throw TypeError("Only strings with one character are supported.");
        }
        start = start.charCodeAt(0);
        end = end.charCodeAt(0);
        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start));
            start += step;
        }
    } else {
        throw TypeError("Only string and number types are supported");
    }
    return range;
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
    //     // Usage!
    //   sleep(500).then(() => {
    //     // Do something after the sleep!
    // });
}

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 
// main functions
window.defaultInput = {
    g: 9.8, // gravity
    L: 67,
    R: 0.1, //angular speed of earth
    lamda: 3, //latitude
    k_1: 1,
    k_2: 1,
    time: arange(0, 222, 0.5) // time
}

function computeFP(input = window.defaultInput) {
    // a_= 1i * (mathjs.sqrt(g / L) * time)
    let a_ = [...new Array(input.time.length)].map((elem, index) => complex(0, sqrt(input.g / input.L) * input.time[index]));

    /*
    ---> getting e^x from fantasy number <---
    x = a + ib -> e^(x) = e^(a) * e^(ib)
    -> e^(x) = e^(a) * cos(b) + isin(b) 
    in js: 
        > a = real part; b = imaginary part
        > e^(x) = e^(a) * e^(ib) = mathjs.complex(mathjs.multilpy(Math.exp(a), Math.cos(b)), Math.sin(b)))

    reference on how to make this: 
        https://mathjs.org/docs/datatypes/complex_numbers.html
        https://numpy.org/doc/stable/reference/generated/numpy.exp.html

    */

    // a = e^(a_)
    let a = [...new Array(input.time.length)].map((elem, index) => complex(multiply(Math.exp(a_[index].re), Math.cos(a_[index].im)), Math.sin(a_[index].im)));

    // b_ = 1i * ((-1) * mathjs.sqrt(g / L) * time) 
    let b_ = [...new Array(input.time.length)].map((elem, index) => complex(0, (-1) * sqrt(input.g / input.L) * input.time[index]));
    // b = e^(b_)
    let b = [...new Array(input.time.length)].map((elem, index) => complex(multiply(Math.exp(b_[index].re), Math.cos(b_[index].im)), Math.sin(b_[index].im)));

    // c_ = 1i * (R * Math.sin(lamda) * (-1) * time)
    let c_ = [...new Array(input.time.length)].map((elem, index) => complex(0, input.R * Math.sin(input.lamda) * (-1) * input.time[index]));
    // c = e^(c_)
    let c = [...new Array(input.time.length)].map((elem, index) => complex(multiply(Math.exp(c_[index].re), Math.cos(c_[index].im)), Math.sin(c_[index].im)));

    // u = (k_1 * a + k_2 * b) * c
    // u = (k_1a + k_2b) * c
    let k1_a = [...new Array(input.time.length)].map((elem, index) => multiply(input.k_1, a[index]));
    let k2_b = [...new Array(input.time.length)].map((elem, index) => multiply(input.k_2, b[index]));
    let k1_ak2_b = [...new Array(input.time.length)].map((elem, index) => add(k1_a[index], k2_b[index]));
    let u = [...new Array(input.time.length)].map((elem, index) => multiply(k1_ak2_b[index], c[index]));

    let x = [...new Array(u.length)].map((elem, index) => u[index].re),
        y = [...new Array(u.length)].map((elem, index) => u[index].im);

    return {
        x: x,
        y: y
    }
}

function createData(input) {
    let values = []
    for (let i = 0; i < input.x.length; i++) {
        values.push({
            x: input.x[i],
            y: input.y[i]
        })
    }
    let data = {
        datasets: [{
            label: 'Foucaults Pendelum',
            data: values,
            backgroundColor: 'blue',
            showLine: true,
            pointRadius: 0,
            borderColor: 'blue',
        }],
    };
    return data;
}

function createFPPlot(input = window.defaultInput) {

    const RESULT = computeFP(input);
    const DATA = createData(RESULT);

    const config = {
        type: 'scatter',
        data: DATA,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '',
                    font: {
                        Family: window.font_famliy,
                        size: 16,
                    },
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'x',
                        font: {
                            family: window.font_famliy,
                            size: 16,
                        },
                    },
                    min: -2,
                    max: 2,
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: window.font_famliy,
                            size: 16,
                        },
                    },
                    min: -2,
                    max: 2
                },
            },
        },
    };

    document.getElementById('fp_line_plot').remove();
    document.getElementById('fp_line_plot_container').innerHTML = '<canvas id="fp_line_plot"></canvas>';
    let ctx1 = document.getElementById('fp_line_plot');
    window.fp_line_chart = new Chart(ctx1, config);
}

function animatePlot() {
    window.fp_line_chart.data.datasets[0].data.push(window.xyData[window.animationIndex]);
    window.animationIndex += 1;
    window.fp_line_chart.update()
    if (window.animationIndex >= window.xyData.length) {
        clearInterval(animinterval);
    }
}

function updateFPPlot(input, animate = false) {
    const RESULT = computeFP(input);
    const DATA = createData(RESULT);
    if (!animate) {
        window.fp_line_chart.data = DATA
        window.fp_line_chart.update()
    } else {
        window.animationIndex = 0;
        window.xyData = DATA.datasets[0].data;

        window.fp_line_chart.data.datasets[0].data = [];
        window.fp_line_chart.options.animation = false;
        window.fp_line_chart.update();
        window.animinterval = setInterval(animatePlot, 20);
    }
}

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 
// handle input

const fp_g_slide = document.getElementById("fp_g_slide"),
    fp_R_slide = document.getElementById("fp_R_slide"),
    fp_lambda_input = document.getElementById("fp_X_input_lambda"),
    fp_k1_input = document.getElementById("fp_X_input_k_1"),
    fp_k2_input = document.getElementById("fp_X_input_k_2"),
    fp_slider = document.getElementsByName("fp_slide"),
    fp_value_fields = document.getElementsByName("fp_slide_value"),
    fp_input_fields = document.getElementsByName("fp_input_field"),
    fp_plot_variables = ["g", "R", "lambda", "k_1", "k_2"];

// -----

const fp_AGAIN_BTN = document.getElementById('fp_animate');
fp_AGAIN_BTN.onclick = function () {
    updateFPPlot({
        g: fp_g_slide.value,
        L: 67,
        R: fp_R_slide.value,
        lamda: fp_lambda_input.value,
        k_1: fp_k1_input.value,
        k_2: fp_k2_input.value,
        time: arange(0, 222, 0.5)
    }, true);
}

const bm_RESET_BTN = document.getElementById('fp_resetBtn');
bm_RESET_BTN.onclick = function () {
    clearInterval(animinterval);
    createFPPlot(); // resets the plot

    fp_g_slide.value = window.defaultInput.g,
        fp_R_slide.value = window.defaultInput.R;

    // fp_slider.forEach((element, index) => { // resets the sliders
    //     const default_value = window.defaultInput[fp_plot_variables[index]];
    //     document.getElementById(element.id).value = default_value;
    // });
    fp_value_fields.forEach((element, index) => { // Reset value fields
        const default_value = window.defaultInput[fp_plot_variables[index]];
        document.getElementById(element.id).innerHTML = default_value;
    });
    fp_lambda_input.value = window.defaultInput.lamda,
        fp_k1_input.value = window.defaultInput.k_1,
        fp_k2_input.value = window.defaultInput.k_2;

}
// -----
for (let entry = 0; entry < fp_slider.length; entry++) {
    fp_slider[entry].oninput = function () {
        let elem_id = fp_slider[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(fp_slider[entry].id).value;
    }
    fp_slider[entry].onchange = function () {
        updateFPPlot({
            g: fp_g_slide.value,
            L: 67,
            R: fp_R_slide.value,
            lamda: fp_lambda_input.value,
            k_1: fp_k1_input.value,
            k_2: fp_k2_input.value,
            time: arange(0, 222, 0.5) // time
        });
    }
}

for (let entry = 0; entry < fp_input_fields.length; entry++) {
    fp_input_fields[entry].onchange = function () {
        updateFPPlot({
            g: fp_g_slide.value,
            L: 67,
            R: fp_R_slide.value,
            lamda: fp_lambda_input.value,
            k_1: fp_k1_input.value,
            k_2: fp_k2_input.value,
            time: arange(0, 222, 0.5) // time
        });
        console.log("!")
    }
}

// -----

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 
// ...
window.onload = createFPPlot()