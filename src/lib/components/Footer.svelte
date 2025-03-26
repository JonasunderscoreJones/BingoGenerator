<div class="footer">
    <div class="footer-left">
        <a href="https://github.com/JonasunderscoreJones" target="_blank" aria-label="GitHub Link"><i class="fab fa-github"></i></a>
        <a href="https://www.youtube.com/channel/UCVIxvKBIMSMgurYS8pK7fSg" target="_blank" aria-label="YouTube Link"><i class="fab fa-youtube"></i></a>
        <a href="https://discord.gg/V2EsuUVmWh" target="_blank" aria-label="Discord Link"><i class="fab fa-discord"></i></a>
        <a href="mailto:me@jonasjones.dev" target="_blank" aria-label="Email Link"><i class="fas fa-envelope"></i></a>
    </div>

    <p>Website by Jonas_Jones 2021 - {year}</p>

    <div class="footer-right">
        <a href="https://jonasjones.dev" class="footer-link" target="_blank">
            Homepage
            <i class="fas fa-external-link"></i>
        </a>
        <a href="https://blog.jonasjones.dev" class="footer-link" target="_blank">
            Blog
            <i class="fas fa-external-link"></i>
        </a>
        <a href="https://docs.jonasjones.dev" class="footer-link" target="_blank">
            Docs
            <i class="fas fa-external-link"></i>
        </a>
    </div>
</div>

<script>
    const year = new Date().getFullYear();
</script>

<style>
    .footer {
        height: 1rem;
        background-color: black;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        bottom: 0px;
        left: 0px;
        right: 0px;
        padding-top: 0.25rem;
        padding-bottom: 0.5rem;
        font-size: 20px;
    }

    .footer-left, .footer-right {
        display: flex;
        align-items: center;
    }

    .footer-left a, .footer-right a {
        margin: 3px 10px;
        display: flex;
        align-items: center;
        color: gray;
        text-decoration: none;
    }

    .footer-left a:hover, .footer-right a:hover {
        color: lightgray;
    }

    .footer-right {
        position: fixed;
        right: 10px; /* Keep the right section fixed */
        bottom: 0;
    }

    .footer-left {
        position: fixed;
        left: 10px; /* Keep the left section fixed */
        bottom: 0;
    }

    .footer-link i {
        margin-left: 5px;
        font-size: 15px;
    }

    @media (max-width: 1200px) {
        .footer-left, .footer-right {
            display: none;
        }
        .footer-left a, .footer-right a {
            display: none;
        }
    }
</style>