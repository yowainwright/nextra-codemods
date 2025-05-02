docker_build(
    'nextra-v3-test-service',
    context='.',
    dockerfile='ops/nextra3.Dockerfile',
    live_update=[
        sync('./src', '/app/src'),
        sync('./ops/scripts/start.sh', '/app/start.sh'),
    ],
)

k8s_yaml('ops/k8s/deployment.yaml')

k8s_resource(
    'nextra-v3-test-service',
    port_forwards=['3000:3000'],
    links=[
        link('http://localhost:3000', 'Nextra v3 => v4 App')
    ]
)
