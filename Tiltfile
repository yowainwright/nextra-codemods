docker_build(
    'nextra-v3-test-service',
    context='.',
    dockerfile='ops/nextra3.Dockerfile',
    live_update=[
        sync('./dist', '/app/dist'),
        sync('./ops/scripts/start.sh', '/app/start.sh'),
    ],
)

dc_resource(
    'test-service',
    links=[
        link('http://localhost:3000', 'Nextra v3 => v4 App')
    ]
)
