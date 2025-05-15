pipeline {
    agent any

    environment {
        IMAGE_NAME = "route_opt_frontend"
        GIT_CREDENTIALS = 'GitHub-ID'
        GIT_REPO_URL = 'https://github.com/CreativeDT/Route-Optimization-Frontend.git'
        GIT_BRANCH = 'main'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: "${env.GIT_REPO_URL}", branch: "${env.GIT_BRANCH}", credentialsId: "${env.GIT_CREDENTIALS}"
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${IMAGE_NAME} .'
                }
            }
        }

        stage('Stop & Remove Old Container') {
            steps {
                script {
                    sh 'docker stop ${IMAGE_NAME} || true'
                    sh 'docker rm ${IMAGE_NAME} || true'
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    sh 'docker run -d --name ${IMAGE_NAME} --restart=always -p 80:80 -p 3000:3000 ${IMAGE_NAME}'
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
        always {
            echo "⚙️ Pipeline finished with status: ${currentBuild.currentResult}"
        }
    }
}
