// Jenkins should have configured next services:
// - Artifactory as 'XXX_atifactory'
// - Docker registry key as 'docker-registry'

def serviceName         = 'test_tool'
def repoCredId          = 'jenkins'
def artifactoryServer   =  Artifactory.server 'XXX_atifactory'
// receive branch name as input from Jenkins job
def branch              = env.BRANCH_NAME
def build_number        = env.BUILD_NUMBER

// docker configuration
def dockerRegistry = 'https://docker.XXX'
def dockerRegistryCredKey = 'docker-registry'
def dockerRepo = 'core'

def excluded = ''
def included = ''

def exclude_list = excluded.split( )
def include_list = included.split( )

def include_exclude_check(include_list, exclude_list) {
  def changeLogSets = currentBuild.changeSets
  def exit_code = 1
  for (int i = 0; i < changeLogSets.size(); i++) {
      def entries = changeLogSets[i].items

      for (int j = 0; j < entries.length; j++) {
          def entry = entries[j]
          def files = new ArrayList(entry.affectedFiles)
          for (int k = 0; k < files.size(); k++) {
              def file = files[k]
              include_list.any {
                if (file.path =~ /${it}/) {
                  exit_code = 0
                  exclude_list.any {
                    if (file.path =~ /${it}/) {
                      exit_code = 1
                      true
                    }
                 }
                 if (exit_code == 0) {
                   true
                 }
              }
           }
        }
     }
  }
  if( exit_code == 1 ) {
    currentBuild.rawBuild.result = Result.ABORTED
    throw new hudson.AbortException('Commit does not affect this build!')
    echo 'Commit does not affect this build!'
  }
}

properties([
  gitLabConnection('XXX_gitlab'),
])

node {
  def workspace = pwd()

  stage('Preparation') {
    // Get code from repository
    // NOTE: some actions may be needed on Jenkins side
    // https://support.cloudbees.com/hc/en-us/articles/226122247-How-to-Customize-Checkout-for-Pipeline-Multibranch-
    checkout([
        $class: 'GitSCM',
        branches: scm.branches,
        extensions: scm.extensions + [[$class: 'LocalBranch'], [$class: 'CleanCheckout']],
        userRemoteConfigs: scm.userRemoteConfigs,
    ])

    if ( branch ==  "develop") { 
      serviceVersion = build_number
    } else {
      serviceVersion = branch + build_number
    }
 
    serviceVersion = serviceVersion.replaceAll('\\/','-')

    def shortCommit = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()

    echo "Running build based on ${branch} branch and commit ${shortCommit}"
    echo "Compiling version ${serviceName}-${serviceVersion}"
  }


  gitlabBuilds(builds: ["Build", "Publish", "Dockerize"]) {
    stage('Build') {
      gitlabCommitStatus("Build") {
        sh """
          npm install mocha
          npm install
          zip -r "test_tool-${serviceVersion}.zip" . -x node_modules/**\\*
        """
      }
    }

    stage('Publish') {
      gitlabCommitStatus("Publish") {
        // Read the upload spec to artifactory.
        def artifactoryUploadDsl = """
        {
	"files": [{
		"pattern": "test_tool-(*).zip",
		"target": "iov_utils/test_tool/{1}/"
	}]
        }
        """
        def buildInfo = Artifactory.newBuildInfo()
        buildInfo.env.capture = true

        // Upload to Artifactory.
        artifactoryServer.upload(artifactoryUploadDsl, buildInfo)

        // Publish build info to Artifactory
        artifactoryServer.publishBuildInfo(buildInfo)
      }
    }

    stage('Dockerize') {
      gitlabCommitStatus("Dockerize") {
        docker.withRegistry(dockerRegistry, dockerRegistryCredKey) {
          def serviceImage = docker.build("${dockerRepo}/${serviceName}:${serviceVersion}")

          // Push container to the Registry
          serviceImage.push()
          if ( scm.branches.toString() == '[develop]' ) {
            serviceImage.push('latest')
          }
        }
      }
    }
  }
  deleteDir()
}
