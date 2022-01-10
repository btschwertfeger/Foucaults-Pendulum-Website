/**
 * Simple website to visualize and manipulate the Foucaults Pendulum.
 * 
 * @author Benjamin Thomas Schwertfeger (January 2022)
 * @email development@b-schwertfeger.de
 * @link https://github.com/btschwertfeger-AWI-Workspace/FoucaultsPendulumWebsite
 **/

// [...]

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

window.xy_limit = .15;
window.xy_limit_default = .15;

function computeFPv2(input = window.defaultInputv2) {
    // const tmax = input.tday * 2; // Time of simulation in seconds
    let initial_x = input.L / 100; // initial x coordinate

    let
        Omega = 2 * Math.PI / input.tday,
        phi = input.lat / 180 * Math.PI;

    let sphi = Math.sin(phi);

    // set up vectors for x, x_d, x_dd, and y, y_d, y_dd
    let
        x = [...new Array(0)].map(() => 0), // x+x_d*t
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

    // loop over everything
    for (let i = 1; i < input.tday; i++) {
        x_dd.push(a_x(y_d[i - 1], x[i - 1]))
        y_dd.push(a_y(x_d[i - 1], y[i - 1]))
        x_d.push(x_d[i - 1] + x_dd[i] * input.dt)
        y_d.push(y_d[i - 1] + y_dd[i] * input.dt)
        x.push(x[i - 1] + x_d[i] * input.dt)
        y.push(y[i - 1] + y_d[i] * input.dt)
    }

    return {
        x: x,
        y: y
    }
}

function createDatav2(input) {
    let values = []
    for (let i = 0; i < input.x.length; i++) {
        if (i % 5 == 0) values.push({
            x: input.x[i],
            y: input.y[i]
        });
    }
    const data = {
        datasets: [{
            label: "Foucaults Pendelum tail",
            data: values,
            backgroundColor: "blue",
            showLine: true,
            pointRadius: 0,
            borderColor: "blue",
            borderWidth: 1
        }, {
            label: "Foucaults Pendelum first point",
            data: [{
                x: 0,
                y: 0
            }],
            backgroundColor: "red",
            pointRadius: 3,
            borderColor: "red",
        }],
    };
    return data;
}

function createFPPlotv2(input = window.defaultInputv2) {

    const RESULT = computeFPv2(input);
    const DATA = createDatav2(RESULT);

    const config = {
        type: "scatter",
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
                    min: -window.xy_limit_default,
                    max: window.xy_limit_default,
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
                    min: -window.xy_limit_default,
                    max: window.xy_limit_default,
                },
            },
        },
    };

    document.getElementById("fp_v2_line_plot").remove();
    document.getElementById("fp_v2_line_plot_container").innerHTML = '<canvas id="fp_v2_line_plot"></canvas>';
    const ctx = document.getElementById("fp_v2_line_plot");
    window.fp_v2_line_chart = new Chart(ctx, config);
}

function setLimit(limit) {
    window.fp_v2_line_chart.options.scales.x.max = limit;
    window.fp_v2_line_chart.options.scales.x.min = -limit;
    window.fp_v2_line_chart.options.scales.y.max = limit;
    window.fp_v2_line_chart.options.scales.y.min = -limit;
}

function animatePlotv2() {
    if (window.fp_v2_line_chart.data.datasets[1].data.length == 1) window.fp_v2_line_chart.data.datasets[0].data.push(window.fp_v2_line_chart.data.datasets[1].data[0]);
    window.fp_v2_line_chart.data.datasets[1].data[0] = window.xyData[window.animationIndex];

    // const len = window.fp_v2_line_chart.data.datasets[0].data.length;
    if (window.animationIndex > 100) window.fp_v2_line_chart.data.datasets[0].data.shift();
    if (
        window.fp_v2_line_chart.data.datasets[1].data[0].x < -window.xy_limit ||
        window.fp_v2_line_chart.data.datasets[1].data[0].x > window.xy_limit ||
        window.fp_v2_line_chart.data.datasets[1].data[0].y < -window.xy_limit ||
        window.fp_v2_line_chart.data.datasets[1].data[0].y > window.xy_limit
    ) window.xy_limit = window.xy_limit * 2;

    setLimit(window.xy_limit);

    window.animationIndex += 1;
    window.fp_v2_line_chart.update();
    if (window.animationIndex >= window.xyData.length) clearInterval(window.animinterval_v2);
}

function updateFPPlotv2(input, animate = false) {
    const RESULT = computeFPv2(input);
    const DATA = createDatav2(RESULT);
    if (!animate) {
        window.fp_v2_line_chart.data = DATA;
        window.fp_v2_line_chart.update();
    } else {
        window.animationIndex = 0;
        window.xyData = DATA.datasets[0].data;

        window.fp_v2_line_chart.data.datasets[0].data = [];
        window.fp_v2_line_chart.options.animation = false;
        window.fp_v2_line_chart.update();
        window.animinterval_v2 = setInterval(animatePlotv2, 30);
    }
}

const
    fp_v2_lat_input = document.getElementById("fp_v2_X_input_lat"),
    fp_v2_L_input = document.getElementById("fp_v2_X_input_L"),
    fp_v2_g_slide = document.getElementById("fp_v2_g_slide"),
    fp_v2_slider = document.getElementsByName("fp_v2_slide"),
    fp_v2_g_value_field = document.getElementById("fp_v2_g_value");

const fp_v2_ANIMATE_BTN = document.getElementById("fp_v2_animateBtn");
fp_v2_ANIMATE_BTN.onclick = () => {
    updateFPPlotv2({
        lat: fp_v2_lat_input.value,
        tday: window.defaultInputv2.tday,
        dt: window.defaultInputv2.dt,
        g: fp_v2_g_slide.value,
        L: fp_v2_L_input.value,
        initial_y: window.defaultInputv2.initial_y,
        initial_u: window.defaultInputv2.initial_u,
        initial_v: window.defaultInputv2.initial_v,
    }, true);
}

const fp_v2_RESET_BTN = document.getElementById("fp_v2_resetBtn");
fp_v2_RESET_BTN.onclick = () => {
    if (window.animinterval_v2) clearInterval(window.animinterval_v2);
    fp_v2_lat_input.value = window.defaultInputv2.lat;
    fp_v2_L_input.value = window.defaultInputv2.L;
    fp_v2_g_slide.value = window.defaultInputv2.g;
    fp_v2_g_value_field.innerHTML = window.defaultInputv2.g;

    window.fp_v2_line_chart.data.datasets[0].data = [];
    window.fp_v2_line_chart.data.datasets[1].data = [{
        x: 0,
        y: 0
    }]
    window.xy_limit = window.xy_limit_default;
    setLimit(window.xy_limit);
    window.fp_v2_line_chart.update();
}

for (let entry = 0; entry < fp_v2_slider.length; entry++) {
    fp_v2_slider[entry].oninput = () => {
        let elem_id = fp_v2_slider[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(`${elem_id}value`).innerHTML = document.getElementById(fp_v2_slider[entry].id).value;
    }
}

window.onload = createFPPlotv2();

// clear data to avoid wrong visuals bc of to many points
window.fp_v2_line_chart.data.datasets[0].data = [];
window.fp_v2_line_chart.update();


/* ----- E O F ----- ----- ----- ----- ----- ----- ----- ----- */