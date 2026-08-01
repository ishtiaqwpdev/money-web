/**
 * Gospel Music Mastery — Dashboard Charts
 * Chart.js helpers + auto-init for dashboard canvases.
 * Demo data only. Requires Chart.js (chart.umd.min.js).
 */
(function (window, document) {
  'use strict';

  if (!window.Chart) {
    console.warn('GMMCharts: Chart.js is not loaded.');
    return;
  }

  var COLORS = {
    orange: '#FFA500',
    orangeSoft: 'rgba(255, 165, 0, 0.22)',
    orangeFill: 'rgba(255, 165, 0, 0.18)',
    navy: '#1F2937',
    navySoft: 'rgba(31, 41, 55, 0.75)',
    body: '#64748B',
    border: '#E5E7EB',
    green: '#22C55E',
    greenSoft: 'rgba(34, 197, 94, 0.75)',
    blue: '#3B82F6',
    blueSoft: 'rgba(59, 130, 246, 0.75)',
    red: '#C0392B',
    gray: '#94A3B8',
    white: '#FFFFFF'
  };

  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  var chartInstances = {};

  function getCanvas(id) {
    return document.getElementById(id);
  }

  function destroyIfExists(id) {
    if (chartInstances[id]) {
      chartInstances[id].destroy();
      delete chartInstances[id];
    }
  }

  function moneyTick(value) {
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
    }
    return '$' + value;
  }

  function sharedTooltip() {
    return {
      backgroundColor: COLORS.navy,
      titleColor: COLORS.white,
      bodyColor: COLORS.white,
      borderColor: COLORS.orange,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      displayColors: true
    };
  }

  function sharedScales(isMoney) {
    return {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: COLORS.body, font: { size: 11, weight: '600' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(229, 231, 235, 0.9)', drawBorder: false },
        ticks: {
          color: COLORS.body,
          font: { size: 11, weight: '600' },
          callback: isMoney
            ? function (value) { return moneyTick(value); }
            : function (value) { return value; }
        }
      }
    };
  }

  function lineAreaDefaults(fill) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: COLORS.navy,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 12, weight: '600' }
          }
        },
        tooltip: sharedTooltip()
      },
      scales: sharedScales(!!fill && fill.money),
      elements: {
        line: { tension: 0.4, borderWidth: 3 },
        point: { radius: 3, hoverRadius: 5, borderWidth: 2, backgroundColor: COLORS.white }
      }
    };
  }

  function createChart(id, config) {
    var canvas = getCanvas(id);
    if (!canvas) return null;
    destroyIfExists(id);
    chartInstances[id] = new Chart(canvas.getContext('2d'), config);
    return chartInstances[id];
  }

  /* ---------- Shared builders ---------- */

  function buildAreaChart(id, labels, data, datasetLabel, money) {
    return createChart(id, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: data,
          borderColor: COLORS.orange,
          backgroundColor: COLORS.orangeFill,
          fill: true,
          pointBackgroundColor: COLORS.orange,
          pointBorderColor: COLORS.white
        }]
      },
      options: lineAreaDefaults({ money: !!money })
    });
  }

  function buildLineChart(id, labels, datasets, money) {
    var mapped = datasets.map(function (ds) {
      return {
        label: ds.label,
        data: ds.data,
        borderColor: ds.color || COLORS.orange,
        backgroundColor: ds.color || COLORS.orange,
        fill: false,
        pointBackgroundColor: ds.color || COLORS.orange,
        pointBorderColor: COLORS.white
      };
    });
    return createChart(id, {
      type: 'line',
      data: { labels: labels, datasets: mapped },
      options: lineAreaDefaults({ money: !!money })
    });
  }

  function buildBarChart(id, labels, datasets, money) {
    var mapped = datasets.map(function (ds) {
      return {
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.color || COLORS.orange,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 28
      };
    });
    return createChart(id, {
      type: 'bar',
      data: { labels: labels, datasets: mapped },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasets.length > 1,
            position: 'bottom',
            labels: {
              color: COLORS.navy,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              font: { size: 12, weight: '600' }
            }
          },
          tooltip: sharedTooltip()
        },
        scales: sharedScales(!!money)
      }
    });
  }

  function buildDoughnutChart(id, labels, data, colors) {
    return createChart(id, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: COLORS.white,
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: COLORS.navy,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14,
              font: { size: 12, weight: '600' }
            }
          },
          tooltip: sharedTooltip()
        }
      }
    });
  }

  /* ---------- Named initializers ---------- */

  function initRevenueChart() {
    return buildAreaChart(
      'gmm-admin-revenue',
      MONTHS_FULL,
      [2800, 3400, 3900, 4600, 5100, 5200, 5800, 6100, 6400, 7000, 7600, 8200],
      'Monthly Revenue',
      true
    );
  }

  function initUserGrowthChart() {
    return buildBarChart('gmm-admin-user-growth', MONTHS_SHORT.slice(0, 6), [
      { label: 'Students Growth', data: [80, 110, 140, 180, 210, 250], color: COLORS.orange },
      { label: 'Teachers Growth', data: [6, 8, 10, 12, 14, 16], color: COLORS.navy }
    ]);
  }

  function initPlatformDistributionChart() {
    return buildDoughnutChart(
      'gmm-admin-platform',
      ['Students', 'Teachers', 'Classes'],
      [1250, 85, 320],
      [COLORS.orange, COLORS.navy, COLORS.blue]
    );
  }

  function initTeacherEarningsChart() {
    return buildLineChart(
      'gmm-teacher-earnings',
      MONTHS_SHORT,
      [{ label: 'Monthly Earnings', data: [120, 180, 210, 260, 300, 340, 380, 420, 390, 450, 480, 520], color: COLORS.orange }],
      true
    );
  }

  function initLessonChart() {
    return buildDoughnutChart(
      'gmm-teacher-lessons',
      ['Completed Lessons', 'Upcoming Lessons', 'Cancelled Lessons'],
      [45, 12, 5],
      [COLORS.green, COLORS.orange, COLORS.red]
    );
  }

  function initTeacherStudentGrowthChart() {
    return buildBarChart('gmm-teacher-students', MONTHS_SHORT.slice(0, 6), [
      { label: 'New Students', data: [2, 3, 4, 5, 3, 6], color: COLORS.orange }
    ]);
  }

  function initStudentLearningChart() {
    return buildLineChart(
      'gmm-student-learning',
      MONTHS_SHORT,
      [{ label: 'Learning Activity', data: [4, 6, 8, 7, 10, 12, 9, 11, 13, 12, 14, 16], color: COLORS.orange }]
    );
  }

  function initStudentLessonStatusChart() {
    return buildDoughnutChart(
      'gmm-student-lesson-status',
      ['Completed', 'Upcoming', 'Remaining'],
      [24, 3, 8],
      [COLORS.green, COLORS.orange, COLORS.navy]
    );
  }

  function initStudentPracticeChart() {
    return buildBarChart('gmm-student-practice', WEEKDAYS, [
      { label: 'Practice Hours', data: [1.5, 2, 1, 2.5, 2, 3, 1.5], color: COLORS.orange }
    ]);
  }

  function initTeacherRegistrationChart() {
    return buildLineChart(
      'gmm-at-registration',
      MONTHS_SHORT,
      [{ label: 'New Teachers', data: [4, 6, 5, 8, 7, 9, 11, 8, 10, 12, 9, 14], color: COLORS.orange }]
    );
  }

  function initTeacherStatusChart() {
    return buildDoughnutChart(
      'gmm-at-status',
      ['Approved', 'Pending', 'Rejected', 'Suspended'],
      [52, 18, 8, 7],
      [COLORS.green, COLORS.orange, COLORS.red, COLORS.gray]
    );
  }

  function initStudentRegistrationChart() {
    return buildLineChart(
      'gmm-as-registration',
      MONTHS_SHORT,
      [{ label: 'New Students', data: [40, 55, 62, 70, 85, 90, 100, 110, 95, 120, 130, 145], color: COLORS.orange }]
    );
  }

  function initStudentLevelChart() {
    return buildDoughnutChart(
      'gmm-as-level',
      ['Beginner', 'Intermediate', 'Advanced'],
      [520, 430, 300],
      [COLORS.orange, COLORS.navy, COLORS.blue]
    );
  }

  function initClassesCreatedChart() {
    return buildLineChart(
      'gmm-ac-created',
      MONTHS_SHORT,
      [{ label: 'Classes Created', data: [12, 18, 22, 28, 30, 35, 32, 40, 38, 42, 45, 50], color: COLORS.orange }]
    );
  }

  function initClassCategoryChart() {
    return buildDoughnutChart(
      'gmm-ac-category',
      ['Piano', 'Vocals', 'Guitar', 'Drums', 'Theory'],
      [90, 75, 55, 40, 60],
      [COLORS.orange, COLORS.navy, COLORS.blue, COLORS.green, COLORS.gray]
    );
  }

  function initBookingChart() {
    return buildLineChart(
      'gmm-ab-analytics',
      MONTHS_SHORT,
      [{ label: 'Bookings', data: [28, 34, 40, 48, 52, 60, 58, 66, 70, 74, 80, 85], color: COLORS.orange }]
    );
  }

  function initBookingStatusChart() {
    return buildDoughnutChart(
      'gmm-ab-status',
      ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
      [120, 30, 350, 40],
      [COLORS.green, COLORS.orange, COLORS.navy, COLORS.red]
    );
  }

  function initPaymentChart() {
    return buildAreaChart(
      'gmm-ap-revenue',
      MONTHS_SHORT,
      [6200, 7100, 8300, 9200, 9800, 9400, 10100, 10800, 11200, 11800, 12400, 13000],
      'Monthly Revenue',
      true
    );
  }

  function initPaymentStatusChart() {
    return buildDoughnutChart(
      'gmm-ap-status',
      ['Completed', 'Pending', 'Failed', 'Refunded'],
      [680, 90, 35, 45],
      [COLORS.green, COLORS.orange, COLORS.red, COLORS.gray]
    );
  }

  function initProgramEnrollmentChart() {
    return buildBarChart('gmm-apr-enrollment', ['Piano', 'Vocals', 'Guitar', 'Drums', 'Theory', 'Worship'], [
      { label: 'Enrollments', data: [250, 320, 180, 145, 210, 95], color: COLORS.orange }
    ]);
  }

  function initProgramCategoryChart() {
    return buildDoughnutChart(
      'gmm-apr-category',
      ['Piano', 'Vocals', 'Guitar', 'Drums', 'Theory', 'Worship'],
      [2, 2, 1, 1, 1, 1],
      [COLORS.orange, COLORS.navy, COLORS.blue, COLORS.green, COLORS.gray, '#F59E0B']
    );
  }

  function initBlogViewsChart() {
    return buildLineChart(
      'gmm-abl-views',
      MONTHS_SHORT,
      [{ label: 'Article Views', data: [420, 510, 580, 640, 720, 800, 760, 880, 940, 1020, 1100, 1250], color: COLORS.orange }]
    );
  }

  function initBlogCategoryChart() {
    return buildDoughnutChart(
      'gmm-abl-category',
      ['Music Education', 'Piano', 'Vocals', 'Worship', 'Teacher Tips'],
      [28, 24, 22, 26, 20],
      [COLORS.orange, COLORS.navy, COLORS.blue, COLORS.green, COLORS.gray]
    );
  }

  function autoInit() {
    var map = [
      ['gmm-admin-revenue', initRevenueChart],
      ['gmm-admin-user-growth', initUserGrowthChart],
      ['gmm-admin-platform', initPlatformDistributionChart],
      ['gmm-teacher-earnings', initTeacherEarningsChart],
      ['gmm-teacher-lessons', initLessonChart],
      ['gmm-teacher-students', initTeacherStudentGrowthChart],
      ['gmm-student-learning', initStudentLearningChart],
      ['gmm-student-lesson-status', initStudentLessonStatusChart],
      ['gmm-student-practice', initStudentPracticeChart],
      ['gmm-at-registration', initTeacherRegistrationChart],
      ['gmm-at-status', initTeacherStatusChart],
      ['gmm-as-registration', initStudentRegistrationChart],
      ['gmm-as-level', initStudentLevelChart],
      ['gmm-ac-created', initClassesCreatedChart],
      ['gmm-ac-category', initClassCategoryChart],
      ['gmm-ab-analytics', initBookingChart],
      ['gmm-ab-status', initBookingStatusChart],
      ['gmm-ap-revenue', initPaymentChart],
      ['gmm-ap-status', initPaymentStatusChart],
      ['gmm-apr-enrollment', initProgramEnrollmentChart],
      ['gmm-apr-category', initProgramCategoryChart],
      ['gmm-abl-views', initBlogViewsChart],
      ['gmm-abl-category', initBlogCategoryChart]
    ];

    map.forEach(function (item) {
      if (getCanvas(item[0])) item[1]();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.GMMCharts = {
    initRevenueChart: initRevenueChart,
    initUserGrowthChart: initUserGrowthChart,
    initPlatformDistributionChart: initPlatformDistributionChart,
    initTeacherEarningsChart: initTeacherEarningsChart,
    initLessonChart: initLessonChart,
    initTeacherStudentGrowthChart: initTeacherStudentGrowthChart,
    initStudentLearningChart: initStudentLearningChart,
    initStudentLessonStatusChart: initStudentLessonStatusChart,
    initStudentPracticeChart: initStudentPracticeChart,
    initTeacherRegistrationChart: initTeacherRegistrationChart,
    initTeacherStatusChart: initTeacherStatusChart,
    initStudentRegistrationChart: initStudentRegistrationChart,
    initStudentLevelChart: initStudentLevelChart,
    initClassesCreatedChart: initClassesCreatedChart,
    initClassCategoryChart: initClassCategoryChart,
    initBookingChart: initBookingChart,
    initBookingStatusChart: initBookingStatusChart,
    initPaymentChart: initPaymentChart,
    initPaymentStatusChart: initPaymentStatusChart,
    initProgramEnrollmentChart: initProgramEnrollmentChart,
    initProgramCategoryChart: initProgramCategoryChart,
    initBlogViewsChart: initBlogViewsChart,
    initBlogCategoryChart: initBlogCategoryChart,
    autoInit: autoInit
  };
})(window, document);
