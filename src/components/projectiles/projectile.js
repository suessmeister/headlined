import * as THREE from "three";

// Normalize mouse coordinates
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set up raycaster
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const direction = raycaster.ray.direction.clone();

  // Create projectile
  const projectile = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  );
  projectile.position.copy(camera.position);
  scene.add(projectile);

  // Animate projectile
  const speed = 0.1;
  const target = camera.position.clone().add(direction.multiplyScalar(100));
  function animateProjectile() {
    const distance = projectile.position.distanceTo(target);
    if (distance > 1) {
      projectile.translateZ(-speed);
      requestAnimationFrame(animateProjectile);
    } else {
      scene.remove(projectile);
    }
  }
  animateProjectile();
}
