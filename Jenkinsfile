pipeline {
  agent any
  environment {
    CI = 'true'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
            sh 'npx playwright install --with-deps'
          } else {
            bat 'npm ci'
            bat 'npx playwright install'
          }
        }
      }
    }
    stage('Run Playwright tests') {
      steps {
        script {
          if (isUnix()) {
            sh 'npx playwright test --reporter=list,allure-playwright --reporter=junit'
          } else {
            bat 'npx playwright test --reporter=list,allure-playwright --reporter=junit'
          }
        }
      }
    }
  }
  post {
    always {
      // Archive Playwright HTML report, JUnit results, and Allure results/report
      archiveArtifacts artifacts: 'playwright-report/**, test-results/**, allure-results/**, allure-report/**', allowEmptyArchive: true
      junit allowEmptyResults: true, testResults: 'test-results/*.xml'
      // Generate Allure report when results exist
      script {
        if (fileExists('allure-results')) {
          if (isUnix()) {
            sh 'npx allure generate allure-results --clean -o allure-report'
          } else {
            bat 'npx allure generate allure-results --clean -o allure-report'
          }
        }
      }
    }
  }
}
