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
            sh 'npx playwright test --reporter=list --reporter=junit'
          } else {
            bat 'npx playwright test --reporter=list --reporter=junit'
          }
        }
      }
    }
  }
  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**, test-results/**', allowEmptyArchive: true
      junit allowEmptyResults: true, testResults: 'test-results/*.xml'
    }
  }
}
