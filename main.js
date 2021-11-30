/*
<!--
    ########################################
    ## @author Benjamin Thomas Schwertfeger (October 2021)
    ## copyright by Benjamin Thomas Schwertfeger (October 2021)
    ## E-Mail: kontakt@b-schwertfeger.de
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

// ----- ----- M A I N - F U N C T I O N S----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 

window.defaultInput = {
    g: 9.8, // gravity
    L: 67, // eigentlich / 10
    R: 0.1, //angular speed of earth
    lamda: 3, //latitude
    k_1: 1,
    k_2: 1,
    time: arange(0, 222, 0.5) // time
}

// ---- C O M P U T A T I O N
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
// ---- C R E A T E - P L O T A B L E - D A T A S E T S
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

// ---- P L O T T I N G
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

// ----- U S E R - I N P U T - H A N D L I N G ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 

const
    fp_g_slide = document.getElementById("fp_g_slide"),
    fp_R_slide = document.getElementById("fp_R_slide"),
    fp_lambda_input = document.getElementById("fp_X_input_lambda"),
    fp_k1_input = document.getElementById("fp_X_input_k_1"),
    fp_k2_input = document.getElementById("fp_X_input_k_2"),
    fp_slider = document.getElementsByName("fp_slide"),
    fp_value_fields = document.getElementsByName("fp_slide_value"),
    fp_input_fields = document.getElementsByName("fp_input_field"),
    fp_plot_variables = ["g", "R", "lambda", "k_1", "k_2"];

// ----- ----- ----- ----- ----- ----- ----- ----- -----

// const fp_AGAIN_BTN = document.getElementById('fp_animate');
// fp_AGAIN_BTN.onclick = function () {
//     updateFPPlot({
//         g: fp_g_slide.value,
//         L: window.defaultInput.L, //67,
//         R: fp_R_slide.value,
//         lamda: fp_lambda_input.value,
//         k_1: window.defaultInput.k_1, //fp_k1_input.value,
//         k_2: window.defaultInput.k_2, //fp_k2_input.value,
//         time: window.defaultInput.time, //arange(0, 222, 0.5)
//     }, true);
// }

// const fp_RESET_BTN = document.getElementById('fp_resetBtn');
// fp_RESET_BTN.onclick = function () {
//     if (window.animinterval)
//         clearInterval(window.animinterval);
//     createFPPlot(); // resets the plot

//     fp_g_slide.value = window.defaultInput.g,
//         fp_R_slide.value = window.defaultInput.R;

//     // fp_slider.forEach((element, index) => { // resets the sliders
//     //     const default_value = window.defaultInput[fp_plot_variables[index]];
//     //     document.getElementById(element.id).value = default_value;
//     // });
//     fp_value_fields.forEach((element, index) => { // Reset value fields
//         const default_value = window.defaultInput[fp_plot_variables[index]];
//         document.getElementById(element.id).innerHTML = default_value;
//     });
//     fp_lambda_input.value = window.defaultInput.lamda,
//         fp_k1_input.value = window.defaultInput.k_1,
//         fp_k2_input.value = window.defaultInput.k_2;

// }

// for (let entry = 0; entry < fp_slider.length; entry++) {
//     fp_slider[entry].oninput = function () {
//         let elem_id = fp_slider[entry].id;
//         elem_id = elem_id.substring(0, elem_id.length - 5)
//         document.getElementById(elem_id + "value").innerHTML = document.getElementById(fp_slider[entry].id).value;
//     }
//     fp_slider[entry].onchange = function () {
//         updateFPPlot({
//             g: fp_g_slide.value,
//             L: window.defaultInput.L,
//             R: fp_R_slide.value,
//             lamda: fp_lambda_input.value,
//             k_1: window.defaultInput.k_1, //fp_k1_input.value,
//             k_2: window.defaultInput.k_2, //fp_k2_input.value,
//             time: window.defaultInput.time,
//         });
//     }
// }

// for (let entry = 0; entry < fp_input_fields.length; entry++) {
//     fp_input_fields[entry].onchange = function () {
//         updateFPPlot({
//             g: fp_g_slide.value,
//             L: window.defaultInput.L,
//             R: fp_R_slide.value,
//             lamda: fp_lambda_input.value,
//             k_1: window.defaultInput.k_1, //fp_k1_input.value,
//             k_2: window.defaultInput.k_2, //fp_k2_input.value,
//             time: window.defaultInput.time,
//         });
//     }
// }

// -----

// ----- R U N - T H E - S I M P L E - O N E ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- 
// uncomment the button configuration above !
// window.onload = createFPPlot()
/* -- -- -- -- -- -- -- -- -- */

/* ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- */
/* ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- */
/* ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- */
/* ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- */
/* ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- */
/* ----- ----- ----- ----- ----- V E R S I O N - 2 ----- ----- ----- ----- ----- */

window.defaultInputv2 = {
    // user defined variabels
    lat: 49,
    tday: 86400, // length of one day in seconds 
    dt: 1,

    // initial conditions
    g: 9.81,
    L: 67 / 10, // Length of pendelum string
    initial_y: 0.1, // initial y
    initial_u: 0, // initial u
    initial_v: 0, // initial v
}

function computeFPv2(input = window.defaultInputv2) {
    const tmax = input.tday * 2; // Time of simulation in seconds
    let initial_x = input.L / 100; // initial x coordinate

    let Omega = 2 * Math.PI / input.tday,
        phi = input.lat / 180 * Math.PI;

    let sphi = Math.sin(phi);

    // set up vectors for x, x_d, x_dd, and y, y_d, y_dd
    let x = [...new Array(0)].map(() => 0), // x+x_d*t
        x_d = [...new Array(0)].map(() => 0), // x_d + x_dd*t
        x_dd = [...new Array(0)].map(() => 0), // 2*Omega*phi*y_d-(g/L)*x
        y = [...new Array(0)].map(() => 0), // y+y_d*t
        y_d = [...new Array(0)].map(() => 0), // y_d + y_dd*t
        y_dd = [...new Array(0)].map(() => 0); // -2*Omega*phi*x_d-(g/L)*y

    function a_x(yd, r) {
        return 2 * Omega * sphi * yd - (input.g / input.L) * r;
    }

    function a_y(xd, r) {
        return -2 * Omega * sphi * xd - (input.g / input.L) * r
    }

    // Initialize vectors
    x[0] = initial_x
    y[0] = input.initial_y
    x_d[0] = input.initial_u
    y_d[0] = input.initial_v
    x_dd[0] = a_x(y_d[0], x[0])
    y_dd[0] = a_y(x_d[0], y[0])
    //plot(x[1], y[1], xlim = c(-1, 1), ylim = c(-1, 1))

    // console.log(x, y, x_d, x_dd, y_d, y_dd)

    // loop over everything
    for (let i = 1; i < input.tday; i++) {
        x_dd.push(a_x(y_d[i - 1], x[i - 1]))
        y_dd.push(a_y(x_d[i - 1], y[i - 1]))
        x_d.push(x_d[i - 1] + x_dd[i] * input.dt)
        y_d.push(y_d[i - 1] + y_dd[i] * input.dt)
        x.push(x[i - 1] + x_d[i] * input.dt)
        y.push(y[i - 1] + y_d[i] * input.dt)
    }
    // console.log(x)

    return {
        x: x,
        y: y
    }
}

function createDatav2(input) {
    let values = []
    for (let i = 0; i < input.x.length; i++) {
        if (i % 5 == 0) {
            values.push({
                x: input.x[i],
                y: input.y[i]
            })
        }
    }
    let data = {
        datasets: [{
            label: 'Foucaults Pendelum',
            data: values,
            backgroundColor: 'blue',
            showLine: true,
            pointRadius: 0,
            borderColor: 'blue',
            borderWidth: 1
        }],
    };
    return data;
}

function createFPPlotv2(input = window.defaultInputv2) {

    const RESULT = computeFPv2(input);
    const DATA = createDatav2(RESULT);

    const config = {
        type: 'scatter',
        data: DATA,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Foucaults Pendelum movement",
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
                    min: -.2,
                    max: .2,
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
                    min: -.2,
                    max: .2,
                },
            },
        },
    };

    document.getElementById('fp_v2_line_plot').remove();
    document.getElementById('fp_v2_line_plot_container').innerHTML = '<canvas id="fp_v2_line_plot"></canvas>';
    let ctx = document.getElementById('fp_v2_line_plot');
    window.fp_v2_line_chart = new Chart(ctx, config);
}

function animatePlotv2() {
    window.fp_v2_line_chart.data.datasets[0].data.push(window.xyData[window.animationIndex]);
    if (animationIndex > 100) {
        window.fp_v2_line_chart.data.datasets[0].data.shift()
    }
    window.animationIndex += 1;
    window.fp_v2_line_chart.update()
    if (window.animationIndex >= window.xyData.length) {
        clearInterval(window.animinterval_v2);
    }
}

function updateFPPlotv2(input, animate = false) {
    const RESULT = computeFPv2(input);
    const DATA = createDatav2(RESULT);
    if (!animate) {
        window.fp_v2_line_chart.data = DATA
        window.fp_v2_line_chart.update()
    } else {
        window.animationIndex = 0;
        window.xyData = DATA.datasets[0].data;

        window.fp_v2_line_chart.data.datasets[0].data = [];
        window.fp_v2_line_chart.options.animation = false;
        window.fp_v2_line_chart.update();
        window.animinterval_v2 = setInterval(animatePlotv2, 20);
    }
}



const
    fp_v2_lat_input = document.getElementById("fp_v2_X_input_lat"),
    // fp_v2_dt_input = document.getElementById("fp_v2_X_input_dt"),
    //fp_v2_tday_input = document.getElementById("fp_v2_X_input_tday"),
    fp_v2_L_input = document.getElementById("fp_v2_X_input_L"),
    fp_v2_g_slide = document.getElementById("fp_v2_g_slide"),
    fp_v2_slider = document.getElementsByName("fp_v2_slide"),
    fp_v2_g_value_field = document.getElementById("fp_v2_g_value");

const fp_v2_ANIMATE_BTN = document.getElementById('fp_v2_animateBtn');
fp_v2_ANIMATE_BTN.onclick = function () {
    updateFPPlotv2({
        lat: fp_v2_lat_input.value,
        tday: window.defaultInputv2.tday, //fp_v2_tday_input.value,
        dt: window.defaultInputv2.dt, //fp_v2_dt_input.value,
        g: fp_v2_g_slide.value,
        L: fp_v2_L_input.value,
        initial_y: window.defaultInputv2.initial_y,
        initial_u: window.defaultInputv2.initial_u,
        initial_v: window.defaultInputv2.initial_v,
    }, true);
}

const fp_v2_RESET_BTN = document.getElementById('fp_v2_resetBtn');
fp_v2_RESET_BTN.onclick = function () {
    if (window.animinterval_v2)
        clearInterval(window.animinterval_v2);
    //createFPPlotv2(); // resets the plot

    fp_v2_lat_input.value = window.defaultInputv2.lat;
    //fp_v2_tday_input.value = window.defaultInputv2.tday
    // fp_v2_dt_input.value = window.defaultInputv2.dt;
    fp_v2_L_input.value = window.defaultInputv2.L;
    fp_v2_g_slide.value = window.defaultInputv2.g;
    fp_v2_g_value_field.innerHTML = window.defaultInputv2.g;

    window.fp_v2_line_chart.data.datasets[0].data = [];
    window.fp_v2_line_chart.update();
}

// let fp_v2_input_fields = document.getElementsByName("fp_v2_input_field");
// for (let entry = 0; entry < fp_v2_input_fields.length; entry++) {
//     fp_v2_input_fields[entry].onchange = function () {
//         updateFPPlotv2({
//             lat: parseInt(fp_v2_lat_input.value),
//             tday: window.defaultInputv2.tday, //parseFloat(fp_v2_tday_input.value),
//             dt: window.defaultInputv2.dt, //parseInt(fp_v2_dt_input.value),
//             g: parseFloat(fp_v2_g_slide.value),
//             L: fp_v2_L_input.value,
//             initial_y: window.defaultInputv2.initial_y,
//             initial_u: window.defaultInputv2.initial_u,
//             initial_v: window.defaultInputv2.initial_v,
//         });
//     }
// }

for (let entry = 0; entry < fp_v2_slider.length; entry++) {
    fp_v2_slider[entry].oninput = function () {
        let elem_id = fp_v2_slider[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(fp_v2_slider[entry].id).value;
    }
    // fp_v2_slider[entry].onchange = function () {
    //     updateFPPlotv2({
    //         lat: fp_v2_lat_input.value,
    //         tday: window.defaultInputv2.tday, //parseFloat(fp_v2_tday_input.value),
    //         dt: window.defaultInputv2.dt, //parseInt(fp_v2_dt_input.value),
    //         g: fp_v2_g_slide.value,
    //         L: fp_v2_L_input.value,
    //         initial_y: window.defaultInputv2.initial_y,
    //         initial_u: window.defaultInputv2.initial_u,
    //         initial_v: window.defaultInputv2.initial_v,
    //     });
    // }
}

window.onload = createFPPlotv2()

// clear data to avoid wrong visuals bc of to many points
window.fp_v2_line_chart.data.datasets[0].data = [];
window.fp_v2_line_chart.update();


/* ----- E O F ----- ----- ----- ----- ----- ----- ----- ----- */