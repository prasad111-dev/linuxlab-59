# LinuxLab — student lab container
# A full Ubuntu 24.04 environment with systemd so students can run real
# Linux Administration tasks (services, firewall, users, packages, cron, SSH).
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8

# Prevent services from auto-starting during image build (systemd not running yet)
RUN printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d && chmod +x /usr/sbin/policy-rc.d

# Base tooling for every lab task
RUN apt-get update && apt-get install -y --no-install-recommends \
    systemd \
    systemd-sysv \
    dbus \
    openssh-server \
    vim \
    nano \
    curl \
    wget \
    git \
    ca-certificates \
    iputils-ping \
    net-tools \
    dnsutils \
    traceroute \
    htop \
    tree \
    sudo \
    bash-completion \
    man-db \
    less \
    tmux \
    python3 \
    python3-pip \
    lsof \
    procps \
    netcat-openbsd \
    iptables \
    ufw \
    cron \
    rsyslog \
    zip \
    unzip \
    xz-utils \
    gettext-base \
    jq \
    grep \
    sed \
    gawk \
    findutils \
    file \
    bc \
    openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Web services commonly used by tasks
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    apache2 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Clean up policy file so runtime services can start under systemd
RUN rm -f /usr/sbin/policy-rc.d

# A default "student" user (tasks create their own users)
RUN useradd -m -s /bin/bash student && echo 'student:student' | chpasswd \
    && echo 'student ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/student \
    && chmod 440 /etc/sudoers.d/student

# No default password for root; terminal runs as root (lab-style access)
RUN passwd -l root

# Entrypoint: (re)generate SSH host keys so each fresh container is unique
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# systemd as PID 1
STOPSIGNAL SIGRTMIN+3
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/sbin/init"]
