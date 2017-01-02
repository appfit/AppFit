## Welcome to the AppFit Project

When you are ready to deploy your application on a public cloud service such as AWS, Google Cloud or Azure, how do you pick the right instance sizes for your application components? Most teams end up over-provisioning the cloud instances which can potentially cost thousands of dollars in wasted expenditure.

We are currently developing a tool which helps development teams and small businesses right-size their application containers for the cloud.

AppFit is a tool to help analyze your existing applications, run some performance measurements on them and recommend the right-sized cloud instances. It uses Docker technology and runs as a web application and can be locally hosted on your Docker Swarm or Kubernetes Cluster.

### How does it work?

AppFit itself uses Docker. It containerizes your applications, adds an instrumentation agent to each container and then runs the containers under a Docker Swarm Cluster. It uses a set of test suites which you specify, and runs them to measure the CPU usage, I/O bandwidth and network bandwidth of each application container. Once the performance benchmarks are obtained, AppFit then recommends the right-sized instance based on its analysis.

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Licensing

AppFit is completely open-source, free to you and covered by the Apache 2.0 license.

### Support or Contact

Please email the core contributors listed on the AppFit github page.
